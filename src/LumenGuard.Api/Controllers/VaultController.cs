using LumenGuard.Api.Data;
using LumenGuard.Api.Services.Crypto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LumenGuard.Api.Controllers;

[Authorize] // Sadece HSM imzalı token'ı olan yetkili kullanıcılar erişebilir
[ApiController]
[Route("api/[controller]")]
public class VaultController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<VaultController> _logger;

    public VaultController(ApplicationDbContext context, ILogger<VaultController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // --- 1. LİSTELEME (READ MASKED) ---
    // Frontend'deki tabloyu besler. Şifreler asla açık gitmez.
    [HttpGet("secrets")]
    public async Task<IActionResult> GetSecretsList()
    {
        _logger.LogInformation("Vault listesi sorgulandı. Kullanıcı: {User}", User.Identity?.Name);

        var secrets = await _context.VaultSecrets
            .Select(s => new 
            {
                s.Id,
                s.SecretName,
                // UI'da "protected" barı görünmesi için maskeli değer
                SecretValue = "••••••••••••••••", 
                CreatedAt = DateTime.UtcNow.ToShortDateString(), // Örnek tarih
                IsHardwareEncrypted = true
            })
            .ToListAsync();

        return Ok(secrets);
    }

    // --- 2. ŞİFRE ÇÖZME (REVEAL WITH HSM) ---
    // Frontend'deki "Göz" ikonuna basıldığında donanımı tetikler.
    [HttpGet("secrets/{id}/reveal")]
    public async Task<IActionResult> RevealSecret(int id)
    {
        // EF Core burada otomatik olarak AesVaultProvider.Decrypt metodunu çağırır.
        // O metodun içinde de SoftHSM (C++ Köprüsü) çalışarak şifreyi donanımla çözer.
        var secret = await _context.VaultSecrets.FindAsync(id);
        
        if (secret == null)
        {
            _logger.LogWarning("Olmayan bir sırra erişim denendi! ID: {Id}", id);
            return NotFound(new { Message = "Secret not found." });
        }

        _logger.LogInformation("KRİTİK: '{SecretName}' şifresi HSM ile çözüldü. İşlemi Yapan: {User}", 
            secret.SecretName, User.Identity?.Name);

        // Not: Audit Log kaydı zaten AesVaultProvider.cs içinde otomatik oluşturuluyor.
        return Ok(new 
        { 
            secret.Id, 
            secret.SecretValue // Burada artık temiz (decrypted) metin var
        });
    }

    // --- 3. YENİ SIR EKLEME (ENCRYPT WITH HSM) ---
    // "Store Secret" butonuna basıldığında çalışır.
    [HttpPost("add-secret")]
    public async Task<IActionResult> AddSecret([FromQuery] string name, [FromQuery] string value)
    {
        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(value))
            return BadRequest("İsim ve değer boş olamaz.");

        var newSecret = new VaultSecret
        {
            SecretName = name,
            SecretValue = value // EF Core Converter sayesinde veritabanına girmeden HSM ile AES-GCM şifrelenir.
        };

        _context.VaultSecrets.Add(newSecret);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Yeni sır mühürlendi: {SecretName}", name);

        return Ok(new { Message = "Veri donanımsal anahtarla mühürlenerek PostgreSQL'e kaydedildi." });
    }

    // --- 4. SİLME (DELETE) ---
    [HttpDelete("secrets/{id}")]
    public async Task<IActionResult> DeleteSecret(int id)
    {
        var secret = await _context.VaultSecrets.FindAsync(id);
        if (secret == null) return NotFound();

        _context.VaultSecrets.Remove(secret);
        await _context.SaveChangesAsync();

        _logger.LogWarning("Sır veritabanından silindi: {SecretName}", secret.SecretName);
        return Ok(new { Message = "Secret deleted successfully." });
    }
}