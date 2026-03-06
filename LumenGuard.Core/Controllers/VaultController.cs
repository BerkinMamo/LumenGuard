using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using LumenGuard.Core.Data;
using LumenGuard.Core.Models;
using LumenGuard.Core.Services.Hsm;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace LumenGuard.Core.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class VaultController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<VaultController> _logger;
    private readonly ILuviaHsmService _luvia;

    public VaultController(
        ApplicationDbContext context, 
        ILogger<VaultController> logger,
        ILuviaHsmService luvia)
    {
        _context = context;
        _logger = logger;
        _luvia = luvia;
    }

    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomerList()
    {
        _logger.LogInformation("KYC Manager requested customer list. Decrypting names via HSM...");

        var customers = await _context.Customers
            .Select(c => new 
            {
                c.Id,
                FullName = c.FullName_Enc, 
                c.Status,
                c.RiskLevel,
                c.CreatedAt
            })
            .ToListAsync();

        return Ok(customers);
    }

    [HttpGet("customers/{id}/details")]
    public async Task<IActionResult> GetCustomerDetails(Guid id)
    {
        var customer = await _context.Customers
            .Include(c => c.Detail)
            .Include(c => c.Documents)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (customer == null) return NotFound(new { Message = "Record not found." });

        _logger.LogInformation("Full PII access for ID: {Id} by {User}", id, User.Identity?.Name);

        return Ok(new
        {
            customer.Id,
            customer.FullName_Enc,
            customer.Status,
            Details = new 
            {
                customer.Detail.Email_Enc,
                customer.Detail.Address_Enc,
                customer.Detail.Phone_Enc,
                customer.Detail.DateOfBirth_Enc,
                customer.Detail.City_Plain
            },
            Documents = customer.Documents.Select(d => new { d.Id, d.DocType, d.CreatedAt })
        });
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs()
    {
        var logs = await _context.AuditLogs
            .OrderByDescending(l => l.Timestamp)
            .ToListAsync();

        return Ok(logs);
    }

    [HttpPatch("customers/{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromQuery] KycStatus newStatus)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer == null) return NotFound();

        var oldStatus = customer.Status;
        customer.Status = newStatus;

        _context.AuditLogs.Add(new AuditLog {
            Action = "KYC_STATUS_CHANGE",
            Timestamp = DateTime.UtcNow,
            Details = $"User {id} status changed: {oldStatus} -> {newStatus} by admin {User.Identity?.Name}"
        });

        await _context.SaveChangesAsync();

        return Ok(new { Message = "Status updated and logged." });
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchByExternalRef([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query)) return BadRequest();

        var searchHash = _luvia.ComputeBlindIndex(query);
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.ExternalRef_Hash == searchHash);

        return customer == null ? NotFound() : Ok(new { customer.Id, customer.Status });
    }
}