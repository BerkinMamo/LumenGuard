using LumenGuard.Api.Data;
using LumenGuard.Api.Services.Hsm;
using LumenGuard.Api.Services.Crypto;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using OpenIddict.Abstractions;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options => {
    options.UseNpgsql(connectionString);
    options.UseOpenIddict();
});

builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

var hsmService = new HsmService(builder.Configuration);
builder.Services.AddSingleton(hsmService);
builder.Services.AddSingleton<AesVaultProvider>();
builder.Services.AddOpenIddict()
    .AddCore(options => {
        options.UseEntityFrameworkCore().UseDbContext<ApplicationDbContext>();
    })
    .AddServer(options => {
        options.SetTokenEndpointUris("/connect/token")
               .SetAuthorizationEndpointUris("/connect/authorize");

        options.AllowPasswordFlow()
               .AllowRefreshTokenFlow();

        var rsaParameters = new RSAParameters
        {
            Modulus = Convert.FromBase64String("/MSf5HFIaNj2oSoaMB/HZucvSQwLbk521AGT+fYgsNZMTc97OMaX9uVq05zHyc0ytTagqgKSiQ9sf/kW720leVo35kA1EW6FLArrk/krPYMZUsgOJDb4o9/26TvcWFagJuz+MP6Wx8if/F819tNU7xGEUbdPFIn3+a8nGIQVHTraYYqOuOH9quMsWXRcTbXKouKcTc6kTU37I5RG57bKFSf7F3kQGsSJAaU2BE31njJL52FulZeBLgEzRxwNYNRuTydUNIuDk4hqnu+y+8FD5IvaouIElMv7gDwYGHBkh0o+uL3bWNXeYmCyYKn0M1IN2r5690CC++9uc4Y/1Chi7Q=="), 
            Exponent = Convert.FromBase64String("AQAB") 
        };

        var hsmSecurityKey = new RsaSecurityKey(rsaParameters) { KeyId = "Luvia-HSM-Key-01" };
        options.RegisterScopes(
        OpenIddictConstants.Scopes.Email,
        OpenIddictConstants.Scopes.Profile,
        OpenIddictConstants.Scopes.Roles,
        "offline_access"
    );
        hsmSecurityKey.CryptoProviderFactory = new HsmCryptoProviderFactory(hsmService);

        var credentials = new SigningCredentials(hsmSecurityKey, SecurityAlgorithms.RsaSha256);
        options.AddSigningCredentials(credentials);

        // Geliştirme için şifreleme sertifikası kalabilir
        options.AddDevelopmentEncryptionCertificate();

        options.UseAspNetCore()
               .EnableTokenEndpointPassthrough();
    });

builder.Services.AddControllers();
builder.Services.AddHostedService<Worker>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
var app = builder.Build();

if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
} else {
    app.UseHsts();
}

app.UseHttpsRedirection(); 
app.UseAuthentication(); 
app.UseAuthorization();
app.MapControllers();
// app.MapGet("/api/setup/generate-vault-key", () =>
// {
//     byte[] rawAesKey = new byte[32];
//     System.Security.Cryptography.RandomNumberGenerator.Fill(rawAesKey);
//     // DİKKAT: BURAYA KENDİ MODULUS DEĞERİNİ YAPIŞTIRMALISIN
//     var rsaParams = new System.Security.Cryptography.RSAParameters {
//         Modulus = Convert.FromBase64String("/MSf5HFIaNj2oSoaMB/HZucvSQwLbk521AGT+fYgsNZMTc97OMaX9uVq05zHyc0ytTagqgKSiQ9sf/kW720leVo35kA1EW6FLArrk/krPYMZUsgOJDb4o9/26TvcWFagJuz+MP6Wx8if/F819tNU7xGEUbdPFIn3+a8nGIQVHTraYYqOuOH9quMsWXRcTbXKouKcTc6kTU37I5RG57bKFSf7F3kQGsSJAaU2BE31njJL52FulZeBLgEzRxwNYNRuTydUNIuDk4hqnu+y+8FD5IvaouIElMv7gDwYGHBkh0o+uL3bWNXeYmCyYKn0M1IN2r5690CC++9uc4Y/1Chi7Q=="),
//         Exponent = Convert.FromBase64String("AQAB")
//     };
//     using var rsa = System.Security.Cryptography.RSA.Create();
//     rsa.ImportParameters(rsaParams);
//     byte[] encryptedDek = rsa.Encrypt(rawAesKey, System.Security.Cryptography.RSAEncryptionPadding.Pkcs1);
//     return Results.Ok(new {
//         Instruction = "Aşağıdaki 'EncryptedDek' değerini kopyalayıp appsettings.json içine yapıştırın.",
//         EncryptedDek = Convert.ToBase64String(encryptedDek),
//         Warning = "Bu işlem tamamlandıktan sonra bu endpoint'i Program.cs içinden SİLİN!"
//     });});
app.Run();