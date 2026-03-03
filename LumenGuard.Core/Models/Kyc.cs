using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LumenGuard.Core.Models;

public class KycDocument
{
    [Key]
    public Guid Id { get; set; }

    public Guid CustomerId { get; set; }
    [ForeignKey("CustomerId")]
    public virtual Customer Customer { get; set; } = null!;

    public string DocType { get; set; } = null!; // ID_FRONT, SELFIE etc.
    public string StoragePath { get; set; } = null!;
    public string FileHash { get; set; } = null!;
    public string AesKey_Wrapped { get; set; } = null!; // File key protected by HSM
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class KycDetail
{
    [Key]
    public Guid Id { get; set; }

    public Guid CustomerId { get; set; }
    [ForeignKey("CustomerId")]
    public virtual Customer Customer { get; set; } = null!;

    // Encrypted Identity Fields
    public string DateOfBirth_Enc { get; set; } = null!;
    public string PlaceOfBirth_Enc { get; set; } = null!;
    public string Gender_Enc { get; set; } = null!;
    public string ExpiryDate_Enc { get; set; } = null!;

    // Address & Contact
    public string City_Plain { get; set; } = null!;
    public string Address_Enc { get; set; } = null!;
    public string Email_Hash { get; set; } = null!;
    public string Email_Enc { get; set; } = null!;
    public string Phone_Hash { get; set; } = null!;
    public string Phone_Enc { get; set; } = null!;
}