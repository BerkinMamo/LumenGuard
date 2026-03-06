using LumenGuard.Core.Data;
using OpenIddict.Abstractions;
using Microsoft.AspNetCore.Identity;
using static OpenIddict.Abstractions.OpenIddictConstants;

public class Worker : IHostedService
{
    private readonly IServiceProvider _serviceProvider;

    public Worker(IServiceProvider serviceProvider) => _serviceProvider = serviceProvider;

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await context.Database.EnsureCreatedAsync();

        var manager = scope.ServiceProvider.GetRequiredService<IOpenIddictApplicationManager>();

        // İstemci Kimliği: Lumen-Guard-Dashboard olarak güncellendi
        if (await manager.FindByClientIdAsync("Lumen-Guard-Dashboard") == null)
        {
            await manager.CreateAsync(new OpenIddictApplicationDescriptor
            {
                ClientId = "Lumen-Guard-Dashboard",
                ClientSecret = "0812fefbf4702ddaba5193d962cb4e1334a2180e",
                DisplayName = "Lumen Guard Security Dashboard",
                Permissions =
                {
                    Permissions.Endpoints.Token,
                    Permissions.GrantTypes.Password,
                    Permissions.GrantTypes.RefreshToken,

                    Permissions.Scopes.Email,
                    Permissions.Scopes.Profile,
                    Permissions.Scopes.Roles,
                    Permissions.Prefixes.Scope + "offline_access",

                    Permissions.ResponseTypes.Token
                }
            });
        }

        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();

        const string adminEmail = "berkinmamo@lunalux.com.tr";
        if (await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var user = new IdentityUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true
            };

            await userManager.CreateAsync(user, "19761976qweR!");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}