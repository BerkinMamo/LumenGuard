using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore; 
using static OpenIddict.Abstractions.OpenIddictConstants;


namespace LumenGuard.Api.Controllers{
    
[ApiController]
[RequireHttps]
public class AuthorizationController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly SignInManager<IdentityUser> _signInManager;

    public AuthorizationController(
        UserManager<IdentityUser> userManager,
        SignInManager<IdentityUser> signInManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
    }

    [HttpPost("~/connect/token"), Produces("application/json")]
    public async Task<IActionResult> Exchange()
    {
        var request = HttpContext.GetOpenIddictServerRequest() ??
            throw new InvalidOperationException("OpenID Connect isteği alınamadı.");

        if (request.IsPasswordGrantType())
        {
            var username = request.Username ?? string.Empty;
            var password = request.Password ?? string.Empty;

            var user = await _userManager.FindByNameAsync(username);
            
            // Kullanıcı yoksa veya şifre yanlışsa aynı hata mesajını dönmek güvenlik için (brute force engelleme) önemlidir.
            if (user == null)
            {
                return CreateErrorResult("Geçersiz kimlik bilgileri.");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, password, lockoutOnFailure: true);
            if (!result.Succeeded)
            {
                return CreateErrorResult("Geçersiz kimlik bilgileri.");
            }

            var identity = new ClaimsIdentity(
                OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                Claims.Name,
                Claims.Role);

            identity.AddClaim(new Claim(Claims.Subject, await _userManager.GetUserIdAsync(user)));
            identity.AddClaim(new Claim(Claims.Name, await _userManager.GetUserNameAsync(user) ?? string.Empty));

            var principal = new ClaimsPrincipal(identity);
            principal.SetScopes(request.GetScopes());

            return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        throw new NotImplementedException("Belirtilen grant type desteklenmiyor.");
    }

    // Tekrarlayan hata kodlarını temizlemek için yardımcı metod
    private IActionResult CreateErrorResult(string description)
    {
        var properties = new AuthenticationProperties(new Dictionary<string, string?>
        {
            [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.InvalidGrant,
            [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = description
        });

        return Challenge(properties, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }
}}