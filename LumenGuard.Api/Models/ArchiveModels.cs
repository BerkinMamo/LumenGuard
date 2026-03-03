using System.ComponentModel.DataAnnotations;

namespace LumenGuard.Api.Models;

// 1. Müşteri Tanıma (KYC) Arşivi Tablosu
public class KycRecord
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public string CustomerReference { get; set; } = string.Empty; // Müşteri No veya TC
    
    [Required]
    public string DocumentType { get; set; } = string.Empty; // "Passport", "ID_Card", "Selfie_Match"
    
    // SoftHSM üzerinden AES-GCM ile şifrelenmiş ham veri veya base64 fotoğraf
    [Required]
    public string EncryptedIdentityData { get; set; } = string.Empty; 
    
    public DateTime VerifiedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Verified"; 
}

// 2. E-İmzalı Müşteri Sözleşmeleri (PAdES) Arşivi Tablosu
public class PadesContract
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid KycRecordId { get; set; } // Hangi müşteriye ait?
    
    [Required]
    public string ContractName { get; set; } = string.Empty; // "Hesap_Açılış_Sözleşmesi.pdf"
    
    [Required]
    public string PdfHash { get; set; } = string.Empty; // İmzalanan dokümanın SHA-256 özeti
    
    // SoftHSM (RSA/ECDSA) ile atılmış kriptografik imza değeri
    [Required]
    public byte[] DigitalSignature { get; set; } = Array.Empty<byte>();
    
    public DateTime SignedAt { get; set; } = DateTime.UtcNow;
    
    // İleride imzanın geçerliliğini yitirmesi durumunda (Revoke) kullanılabilir
    public bool IsSignatureValid { get; set; } = true; 
}