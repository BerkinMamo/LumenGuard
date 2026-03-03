using LumenGuard.Core.Data;
using LumenGuard.Core.Models;
using LumenGuard.Core.Services.Crypto;
using LumenGuard.Core.Services.Hsm;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

    /// <summary>
    /// Retrieves a list of customers with masked sensitive data for dashboard display.
    /// </summary>
    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomerList()
    {
        _logger.LogInformation("Customer list requested by user: {User}", User.Identity?.Name);

        var customers = await _context.Customers
            .Select(c => new 
            {
                c.Id,
                // Masking names for general list view to maintain zero-knowledge principles in UI
                FullName = "PROTECTED_DATA", 
                c.Status,
                c.RiskLevel,
                c.CreatedAt
            })
            .ToListAsync();

        return Ok(customers);
    }

    /// <summary>
    /// Fetches full decrypted details of a specific customer using the HSM-backed provider.
    /// </summary>
    [HttpGet("customers/{id}/details")]
    public async Task<IActionResult> GetCustomerDetails(Guid id)
    {
        // Entity Framework ValueConverter automatically handles decryption via AesVaultProvider.
        var customer = await _context.Customers
            .Include(c => c.Detail)
            .Include(c => c.Documents)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (customer == null)
        {
            _logger.LogWarning("Unauthorized or invalid access attempt to customer details. ID: {Id}", id);
            return NotFound(new { Message = "Customer record not found." });
        }

        _logger.LogInformation("CRITICAL: PII data for customer '{Id}' decrypted via Luvia HSM. Accessed by: {User}", 
            id, User.Identity?.Name);

        return Ok(new
        {
            customer.Id,
            customer.FullName_Enc, // Automatically decrypted by EF Core Converter
            customer.Status,
            Details = new 
            {
                customer.Detail.Email_Enc,
                customer.Detail.Address_Enc,
                customer.Detail.Phone_Enc,
                customer.Detail.DateOfBirth_Enc,
                customer.Detail.City_Plain // Non-encrypted field for regional filtering
            },
            Documents = customer.Documents.Select(d => new { d.Id, d.DocType, d.CreatedAt })
        });
    }

    /// <summary>
    /// Performs a high-speed search using Blind Indexing (HMAC) without decrypting database records.
    /// </summary>
    [HttpGet("search")]
    public async Task<IActionResult> SearchByExternalRef([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query)) 
            return BadRequest("Search query cannot be empty.");

        // Compute the HMAC of the search term using Luvia HSM to match against the indexed column.
        var searchHash = _luvia.ComputeBlindIndex(query);

        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.ExternalRef_Hash == searchHash);

        if (customer == null)
        {
            _logger.LogInformation("Search query returned no results for the provided reference hash.");
            return NotFound(new { Message = "No matching record found." });
        }

        return Ok(new { customer.Id, customer.Status, customer.CreatedAt });
    }

    /// <summary>
    /// Updates the KYC verification status for a specific customer.
    /// </summary>
    [HttpPatch("customers/{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromQuery] KycStatus newStatus)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer == null) return NotFound();

        var oldStatus = customer.Status;
        customer.Status = newStatus;
        
        await _context.SaveChangesAsync();

        _logger.LogInformation("Customer status updated. ID: {Id} | Transition: {Old} -> {New}", 
            id, oldStatus, newStatus);
            
        return Ok(new { Message = "Customer KYC status updated successfully." });
    }
}