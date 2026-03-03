using LumenGuard.Core.Data;
using LumenGuard.Core.Services.Hsm;
using LumenGuard.Core.Services.Crypto;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using OpenIddict.Abstractions;

var builder = WebApplication.CreateBuilder(args);

// DB Configuration
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options => {
    options.UseNpgsql(connectionString);
    options.UseOpenIddict();
});

// Identity
builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddHttpContextAccessor();

// HSM Services - Properly registered to avoid CS0246 and ASP0000
var hsmService = new HsmService(builder.Configuration);
builder.Services.AddSingleton<ILuviaHsmService>(hsmService);
builder.Services.AddSingleton<HsmService>(hsmService); // Needed for the factory below
builder.Services.AddSingleton<AesVaultProvider>();

// OpenIddict
builder.Services.AddOpenIddict()
    .AddCore(options => {
        options.UseEntityFrameworkCore().UseDbContext<ApplicationDbContext>();
    })
    .AddServer(options => {
        options.SetTokenEndpointUris("/connect/token")
               .SetAuthorizationEndpointUris("/connect/authorize");

        options.AllowPasswordFlow().AllowRefreshTokenFlow();

        var rsaParameters = new RSAParameters
        {
            Modulus = Convert.FromBase64String("/MSf5HFIaNj2oSoaMB/HZucvSQwLbk521AGT+fYgsNZMTc97OMaX9uVq05zHyc0ytTagqgKSiQ9sf/kW720leVo35kA1EW6FLArrk/krPYMZUsgOJDb4o9/26TvcWFagJuz+MP6Wx8if/F819tNU7xGEUbdPFIn3+a8nGIQVHTraYYqOuOH9quMsWXRcTbXKouKcTc6kTU37I5RG57bKFSf7F3kQGsSJAaU2BE31njJL52FulZeBLgEzRxwNYNRuTydUNIuDk4hqnu+y+8FD5IvaouIElMv7gDwYGHBkh0o+uL3bWNXeYmCyYKn0M1IN2r5690CC++9uc4Y/1Chi7Q=="), 
            Exponent = Convert.FromBase64String("AQAB") 
        };

        var hsmSecurityKey = new RsaSecurityKey(rsaParameters) { KeyId = "Luvia-HSM-Key-01" };
        
        // Use the pre-created hsmService instance
        hsmSecurityKey.CryptoProviderFactory = new HsmCryptoProviderFactory(hsmService);

        options.RegisterScopes(
            OpenIddictConstants.Scopes.Email,
            OpenIddictConstants.Scopes.Profile,
            OpenIddictConstants.Scopes.Roles,
            "offline_access"
        );

        options.AddSigningCredentials(new SigningCredentials(hsmSecurityKey, SecurityAlgorithms.RsaSha256));
        options.AddDevelopmentEncryptionCertificate();

        options.UseAspNetCore().EnableTokenEndpointPassthrough();
    });

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLuviaFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddHostedService<Worker>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection(); 
app.UseRouting();
app.UseCors("AllowLuviaFrontend");
app.UseAuthentication(); 
app.UseAuthorization();
app.MapControllers();

app.Run();