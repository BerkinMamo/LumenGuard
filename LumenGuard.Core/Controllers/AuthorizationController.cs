using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;
using System.Collections.Immutable;
using System.Security.Claims;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace LumenGuard.Core.Controllers
{
    [ApiController]
    public class AuthorizationController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly IOpenIddictTokenManager _tokenManager;

        public AuthorizationController(
            UserManager<IdentityUser> userManager,
            SignInManager<IdentityUser> signInManager,
            IOpenIddictTokenManager tokenManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenManager = tokenManager;
        }

        [HttpPost("~/connect/token"), Produces("application/json")]
        [Consumes("application/x-www-form-urlencoded")]
        public async Task<IActionResult> Exchange()
        {
            var request = HttpContext.GetOpenIddictServerRequest();
            
            if (request == null)
            {
                return BadRequest(new OpenIddictResponse
                {
                    Error = Errors.InvalidRequest,
                    ErrorDescription = "Lumen Guard: OIDC isteği parse edilemedi."
                });
            }

            if (request.IsPasswordGrantType())
            {
                var user = await _userManager.FindByNameAsync(request.Username ?? string.Empty);
                if (user == null) return CreateErrorResult("Kullanıcı adı veya şifre hatalı.");

                var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password ?? string.Empty, lockoutOnFailure: true);
                if (result.IsLockedOut) return CreateErrorResult("Hesap kilitlendi.");
                if (!result.Succeeded) return CreateErrorResult("Kullanıcı adı veya şifre hatalı.");

                var identity = new ClaimsIdentity(
                    OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                    Claims.Name,
                    Claims.Role);

                identity.SetClaim(Claims.Subject, await _userManager.GetUserIdAsync(user));
                identity.SetClaim(Claims.Name, await _userManager.GetUserNameAsync(user));
                
                var roles = await _userManager.GetRolesAsync(user);
                identity.SetClaims(Claims.Role, roles.ToImmutableArray());
                
                var principal = new ClaimsPrincipal(identity);
                principal.SetScopes(request.GetScopes());

                return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
            }

            return BadRequest(new OpenIddictResponse
            {
                Error = Errors.UnsupportedGrantType,
                ErrorDescription = "Belirtilen grant type desteklenmiyor."
            });
        }

        [HttpPost("~/connect/logout"), Authorize]
        public async Task<IActionResult> Logout()
        {
            var userId = User.FindFirst(Claims.Subject)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                var tokens = _tokenManager.FindBySubjectAsync(userId);
                await foreach (var token in tokens)
                {
                    await _tokenManager.DeleteAsync(token);
                }
            }

            return SignOut(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        private IActionResult CreateErrorResult(string description)
        {
            var properties = new AuthenticationProperties(new Dictionary<string, string?>
            {
                [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.InvalidGrant,
                [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = description
            });

            return Challenge(properties, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }
    }
}