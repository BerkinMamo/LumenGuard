public class SystemHealthDto
{
    public HsmStatus Hsm { get; set; } = new();
    public AuthStatus AuthEngine { get; set; } = new();
    public TokenStatus TokenInfo { get; set; } = new();
    public NetworkStatus Network { get; set; } = new();
}

public class HsmStatus { 
    public string Label { get; set; } = "HSM Node";
    public string Manufacturer { get; set; } = "Unknown";    public string Model { get; set; } = "Initializing..."; 
    public bool IsReady { get; set; } 
}

public class AuthStatus { 
    public string Label { get; set; } = "Auth Engine";
    public string Version { get; set; } = "N/A";
    public bool IsUp { get; set; } 
}

public class TokenStatus { 
    public string Label { get; set; } = "Signing";
    public string Algorithm { get; set; } = "N/A"; 
    public bool IsValid { get; set; } 
}

public class NetworkStatus {
    public string Label { get; set; } = "Network";
    public string Protocol { get; set; } = "N/A";
    public bool IsSecure { get; set; }
}