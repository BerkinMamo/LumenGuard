using LumenGuard.Core.Data;
using LumenGuard.Core.Services.Hsm;
using LumenGuard.Core.Services.Crypto;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using OpenIddict.Abstractions;
using LumenGuard.Core;

var builder = WebApplication.CreateBuilder(args);

// 1. Veritabanı Yapılandırması (PostgreSQL + OpenIddict Store)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options => {
    options.UseNpgsql(connectionString);
    options.UseOpenIddict();
});

// 2. Kimlik Yönetimi (Identity)
builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddHttpContextAccessor();

// 3. HSM Servis Kayıtları (Singleton - Kurumsal Performans)
// Nesneyi bir kez oluşturup hem interface hem de somut sınıf olarak kaydediyoruz
var hsmService = new HsmService(builder.Configuration);
builder.Services.AddSingleton<ILuviaHsmService>(hsmService);
builder.Services.AddSingleton<HsmService>(hsmService); 
builder.Services.AddSingleton<AesVaultProvider>();

// 4. OpenIddict Sunucu Yapılandırması (HSM İmzalı Tokenlar)
builder.Services.AddOpenIddict()
    .AddCore(options => {
        options.UseEntityFrameworkCore().UseDbContext<ApplicationDbContext>();
    })
    .AddServer(options => {
        // Endpoint rotaları
        options.SetTokenEndpointUris("/connect/token")
               .SetAuthorizationEndpointUris("/connect/authorize");

        options.AllowPasswordFlow().AllowRefreshTokenFlow();

        // HSM RSA Anahtar Parametreleri (Luvia Master Key)
        var rsaParameters = new RSAParameters
        {
            Modulus = Convert.FromBase64String("/MSf5HFIaNj2oSoaMB/HZucvSQwLbk521AGT+fYgsNZMTc97OMaX9uVq05zHyc0ytTagqgKSiQ9sf/kW720leVo35kA1EW6FLArrk/krPYMZUsgOJDb4o9/26TvcWFagJuz+MP6Wx8if/F819tNU7xGEUbdPFIn3+a8nGIQVHTraYYqOuOH9quMsWXRcTbXKouKcTc6kTU37I5RG57bKFSf7F3kQGsSJAaU2BE31njJL52FulZeBLgEzRxwNYNRuTydUNIuDk4hqnu+y+8FD5IvaouIElMv7gDwYGHBkh0o+uL3bWNXeYmCyYKn0M1IN2r5690CC++9uc4Y/1Chi7Q=="), 
            Exponent = Convert.FromBase64String("AQAB") 
        };

        var hsmSecurityKey = new RsaSecurityKey(rsaParameters) { KeyId = "Luvia-HSM-Key-01" };
        
        // HSM tabanlı imzalama fabrikasını bağlıyoruz (Tokenlar HSM ile mühürlenir)
        hsmSecurityKey.CryptoProviderFactory = new HsmCryptoProviderFactory(hsmService);

        options.RegisterScopes(
            OpenIddictConstants.Scopes.Email,
            OpenIddictConstants.Scopes.Profile,
            OpenIddictConstants.Scopes.Roles,
            "offline_access"
        );

        options.AddSigningCredentials(new SigningCredentials(hsmSecurityKey, SecurityAlgorithms.RsaSha256));
        options.AddDevelopmentEncryptionCertificate();

        // Middleware üzerinden akışa izin ver (AuthorizationController için şart)
        options.UseAspNetCore().EnableTokenEndpointPassthrough();
    });

// 5. API, JSON ve CORS Ayarları
builder.Services.AddControllers()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // C# Property isimlerini (AuditLog, FullName vb.) korur
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLuviaFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Frontend portu
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Auth token'lar için şart
    });
});

builder.Services.AddHostedService<Worker>(); // Background KYC/Audit işlemleri
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Pipeline Yapılandırması
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection(); 
app.UseRouting();

// CORS Middleware'i Routing ve Auth arasında olmalı
app.UseCors("AllowLuviaFrontend"); 

app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers(); // VaultController'daki endpoint'leri aktif eder

app.Run();