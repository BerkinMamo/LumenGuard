namespace LumenGuard.Core.Data;

public class AuditLog
{
    public int Id { get; set; }
    public string? Username { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? Details { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? IpAddress { get; set; }
    public bool IsSuccess { get; set; }
}