using System.ComponentModel.DataAnnotations;

namespace LumenGuard.Core.Models;

public enum KycStatus { Pending, Verified, Rejected }

public class Customer
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string IdentityUserId { get; set; } = null!; // Linked to AspNetUsers table

    [Required]
    [StringLength(64)]
    public string ExternalRef_Hash { get; set; } = null!; // Blind Index (TCKN/Passport)

    [Required]
    public string FullName_Enc { get; set; } = null!; // AES Encrypted Name

    public KycStatus Status { get; set; } = KycStatus.Pending;

    public int RiskLevel { get; set; }

    public bool IsLoginEnabled { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public virtual ICollection<KycDocument> Documents { get; set; } = new List<KycDocument>();
    public virtual KycDetail Detail { get; set; } = null!;
}