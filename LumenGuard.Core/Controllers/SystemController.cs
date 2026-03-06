using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using LumenGuard.Core.Services.Hsm;
using Microsoft.Extensions.Configuration;

namespace LumenGuard.Core.Controllers
{
    [Route("api/system")]
    [ApiController]
    [Authorize]
    public class SystemController : ControllerBase
    {
        private readonly ILuviaHsmService _hsmService;
        private readonly IConfiguration _configuration;

        public SystemController(ILuviaHsmService hsmService, IConfiguration configuration)
        {
            _hsmService = hsmService;
            _configuration = configuration;
        }

        [HttpGet("health-check")]
        public IActionResult GetHealth()
        {
            var hsmDetected = _hsmService.IsHsmOnline();
            
            var hsmConfig = _hsmService.GetActiveConfig();

            var manufacturerName = _hsmService.GetManufacturer(); 

            var status = new SystemHealthDto
            {
                Hsm = new HsmStatus 
                { 
                    Label = "HSM Engine",
                    IsReady = hsmDetected, 
                    Manufacturer = manufacturerName,
                    Model = hsmDetected ? $"{manufacturerName} ({hsmConfig.Label})" : "NO HSM DETECTED" 
                },
                AuthEngine = new AuthStatus 
                { 
                    Label = "IAM Engine",
                    Version = "Luvia v1.0.4-stable",
                    IsUp = true 
                },
                TokenInfo = new TokenStatus 
                { 
                    Label = "Token Algorithm",
                    Algorithm = "RSA-OAEP (2048-bit)",
                    IsValid = User.Identity?.IsAuthenticated ?? false
                },
                Network = new NetworkStatus
                {
                    Label = "Network Security",
                    Protocol = HttpContext.Request.IsHttps ? "TLS 1.3 Active" : "Insecure HTTP",
                    IsSecure = HttpContext.Request.IsHttps
                }
            };

            return Ok(status);
        }
    }
}