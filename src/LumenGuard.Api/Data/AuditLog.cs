namespace LumenGuard.Api.Data;

public class AuditLog
{
    public int Id { get; set; }
    public string? Username { get; set; } // Hareketi yapan kişi (Örn: berkin)
    public string Action { get; set; } = string.Empty; // Örn: "SECRET_DECRYPTED", "HSM_SIGN_INVOKED"
    public string? Details { get; set; } // Hangi veriye dokunuldu?
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? IpAddress { get; set; }
    public bool IsSuccess { get; set; }
}