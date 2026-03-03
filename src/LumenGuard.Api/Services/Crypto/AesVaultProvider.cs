using System.Security.Cryptography;
using System.Text;
using LumenGuard.Api.Services.Hsm;
using LumenGuard.Api.Data;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;

namespace LumenGuard.Api.Services.Crypto;

public class AesVaultProvider
{
    private byte[]? _aesKey;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AesVaultProvider(
        HsmService hsmService, 
        IConfiguration config, 
        IServiceScopeFactory scopeFactory,
        IHttpContextAccessor httpContextAccessor)
    {
        _scopeFactory = scopeFactory;
        _httpContextAccessor = httpContextAccessor;
        
        var encryptedDekBase64 = config["HsmConfig:EncryptedDek"];
        if (string.IsNullOrEmpty(encryptedDekBase64))
        {
            Console.WriteLine(">>> BOOTSTRAP: Encrypted DEK henüz yapılandırılmadı.");
            return;
        }

        var encryptedDek = Convert.FromBase64String(encryptedDekBase64);
        _aesKey = hsmService.DecryptData(encryptedDek);
    }

    public string Encrypt(string plainText)
    {
        if (string.IsNullOrEmpty(plainText)) return plainText;
        if (_aesKey == null) throw new InvalidOperationException("Güvenlik İhlali: DEK anahtarı olmadan şifreleme yapılamaz!");

        byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);
        byte[] nonce = new byte[12];
        RandomNumberGenerator.Fill(nonce);
        
        byte[] cipherBytes = new byte[plainBytes.Length];
        byte[] tag = new byte[16];

        using var aesGcm = new AesGcm(_aesKey, tag.Length);
        aesGcm.Encrypt(nonce, plainBytes, cipherBytes, tag);

        return $"{Convert.ToBase64String(nonce)}:{Convert.ToBase64String(tag)}:{Convert.ToBase64String(cipherBytes)}";
    }

    public string Decrypt(string cipherText)
    {
        if (string.IsNullOrEmpty(cipherText)) return cipherText;
        if (_aesKey == null) throw new InvalidOperationException("Güvenlik İhlali: DEK anahtarı olmadan şifre çözülemez!");

        var parts = cipherText.Split(':');
        if (parts.Length != 3) throw new FormatException("Geçersiz şifreli veri formatı.");

        byte[] nonce = Convert.FromBase64String(parts[0]);
        byte[] tag = Convert.FromBase64String(parts[1]);
        byte[] cipherBytes = Convert.FromBase64String(parts[2]);
        byte[] plainBytes = new byte[cipherBytes.Length];

        using var aesGcm = new AesGcm(_aesKey, tag.Length);
        aesGcm.Decrypt(nonce, cipherBytes, tag, plainBytes);

        // --- İSTEK KAYNAĞINI (SOURCE) TESPİT ETME ---
        var context = _httpContextAccessor.HttpContext;
        var ipAddress = context?.Connection?.RemoteIpAddress?.ToString() ?? "Arka Plan İşlemi / Bilinmiyor";
        var username = context?.User?.Identity?.IsAuthenticated == true ? context.User.Identity.Name : "Sistem Anonim";
        var requestMethod = context?.Request?.Method ?? "Bilinmiyor";
        var requestPath = context?.Request?.Path.Value ?? "Bilinmeyen Yol";

        using (var scope = _scopeFactory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.AuditLogs.Add(new AuditLog 
            {
                Action = "SECRET_DECRYPTED",
                Details = $"Zarf Şifreleme Çözüldü. Kaynak API: [{requestMethod}] {requestPath}",
                IsSuccess = true,
                Username = username,
                IpAddress = ipAddress
            });
            db.SaveChanges();
        }

        return Encoding.UTF8.GetString(plainBytes);
    }
}