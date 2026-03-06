using LumenGuard.Core.Data;
using LumenGuard.Core.Services.Hsm;
using LumenGuard.Core.Services.Crypto;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using System.Security.Authentication;
using OpenIddict.Abstractions;
using Polly;
using Polly.Extensions.Http;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;
using OpenIddict.Validation.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    options.ConfigureHttpsDefaults(httpsOptions =>
    {
        httpsOptions.SslProtocols = SslProtocols.Tls13;
    });
});

var retryPolicy = HttpPolicyExtensions
    .HandleTransientHttpError()
    .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));

var hsmService = new HsmService(builder.Configuration);
builder.Services.AddSingleton<ILuviaHsmService>(hsmService);
builder.Services.AddSingleton<AesVaultProvider>();

builder.Services.AddHttpClient("SeaweedFSClient")
    .AddPolicyHandler(retryPolicy);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options => {
    options.UseNpgsql(connectionString);
    options.UseOpenIddict();
});

builder.Services.AddIdentity<IdentityUser, IdentityRole>(options => {
    options.Password.RequiredLength = 6;
    options.Password.RequireDigit = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Events.OnRedirectToLogin = context =>
    {
        if (context.Request.Path.StartsWithSegments("/api") || 
            context.Request.Path.StartsWithSegments("/connect"))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        }
        else
        {
            context.Response.Redirect(context.RedirectUri);
        }
        return Task.CompletedTask;
    };
});

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme;
});

builder.Services.AddOpenIddict()
    .AddCore(options => {
        options.UseEntityFrameworkCore().UseDbContext<ApplicationDbContext>();
    })
    .AddServer(options => {
        options.SetTokenEndpointUris("/connect/token");
        options.AllowPasswordFlow().AllowRefreshTokenFlow();
        options.SetAccessTokenLifetime(TimeSpan.FromMinutes(30)); 

        var rsaParameters = new RSAParameters {
            Modulus = Convert.FromBase64String("/MSf5HFIaNj2oSoaMB/HZucvSQwLbk521AGT+fYgsNZMTc97OMaX9uVq05zHyc0ytTagqgKSiQ9sf/kW720leVo35kA1EW6FLArrk/krPYMZUsgOJDb4o9/26TvcWFagJuz+MP6Wx8if/F819tNU7xGEUbdPFIn3+a8nGIQVHTraYYqOuOH9quMsWXRcTbXKouKcTc6kTU37I5RG57bKFSf7F3kQGsSJAaU2BE31njJL52FulZeBLgEzRxwNYNRuTydUNIuDk4hqnu+y+8FD5IvaouIElMv7gDwYGHBkh0o+uL3bWNXeYmCyYKn0M1IN2r5690CC++9uc4Y/1Chi7Q=="), 
            Exponent = Convert.FromBase64String("AQAB") 
        };
        var hsmSecurityKey = new RsaSecurityKey(rsaParameters) { KeyId = "Luvia-Key-Test" };
        hsmSecurityKey.CryptoProviderFactory = new HsmCryptoProviderFactory(hsmService);

        options.AddSigningCredentials(new SigningCredentials(hsmSecurityKey, SecurityAlgorithms.RsaSha256));
        options.AddDevelopmentEncryptionCertificate(); 
        
        options.UseAspNetCore()
               .EnableTokenEndpointPassthrough()
               .DisableTransportSecurityRequirement();
    })
    .AddValidation(options =>
    {
        options.UseLocalServer();
        options.UseAspNetCore();
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
    c.SwaggerDoc("v1", new() { Title = "LumenGuard Vault API", Version = "v1" });
});

builder.Services.AddControllers();

builder.Services.AddCors(options => {
    options.AddPolicy("AllowLuviaFrontend", policy => {
        policy.WithOrigins("https://localhost:3000", "https://lumen.lunalux.com.tr")
              .AllowAnyHeader().AllowAnyMethod().AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Luvia API v1"));
}

app.UseHttpsRedirection(); 
app.UseRouting();
app.UseCors("AllowLuviaFrontend"); 

app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers(); 

app.Run();