using System.Security.Cryptography;
using System.Text;
using LumenGuard.Api.Services.Hsm;

namespace LumenGuard.Api.Services.Crypto;

public class AesVaultProvider
{
    private readonly byte[] _aesKey;

    public AesVaultProvider(HsmService hsmService, IConfiguration config)
{
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

        return Encoding.UTF8.GetString(plainBytes);
    }
}