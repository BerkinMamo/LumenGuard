using LumenGuard.Api.Data;
using OpenIddict.Abstractions;
using Microsoft.AspNetCore.Identity;

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

        // Luvia Vault Uygulamasını Kaydet
        if (await manager.FindByClientIdAsync("luvia-vault-app") == null)
        {
            await manager.CreateAsync(new OpenIddictApplicationDescriptor
            {
                ClientId = "luvia-vault-app",
                ClientSecret = "luvia-secret-9988",
                DisplayName = "Luvia Vault Dashboard",
                Permissions =
{
    OpenIddictConstants.Permissions.Endpoints.Token,
    OpenIddictConstants.Permissions.GrantTypes.Password,
    OpenIddictConstants.Permissions.GrantTypes.RefreshToken,

    // Burası Kritik: Uygulamanın scope kullanmasına izin ver 
    OpenIddictConstants.Permissions.Prefixes.Scope + "email",
    OpenIddictConstants.Permissions.Prefixes.Scope + "profile",
    OpenIddictConstants.Permissions.Prefixes.Scope + "roles",
    OpenIddictConstants.Permissions.Prefixes.Scope + "offline_access", // Refresh token için gerekli
    
    // Alternatif olarak doğrudan sabitleri kullanmaya devam edebilirsin ama 'offline_access' eklemeyi unutma
    OpenIddictConstants.Permissions.Scopes.Email,
    OpenIddictConstants.Permissions.Scopes.Profile,
    OpenIddictConstants.Permissions.Scopes.Roles
}
            });
        }
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();

        if (await userManager.FindByNameAsync("berkin") == null)
        {
            var user = new IdentityUser
            {
                UserName = "berkin",
                Email = "berkin@lumenguard.com",
                EmailConfirmed = true
            };
            await userManager.CreateAsync(user, "Lumen!12345");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}