using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddAuthentication();
builder.Services.AddAuthorization();
// 1. GATEWAY CORS AYARLARI
// Frontend'den (localhost:3000) gelen isteklerin engellenmemesi için kritik.
builder.Services.AddCors(options =>
{
    options.AddPolicy("GatewayCorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // v0/React portun
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Auth token'lar için gerekli
    });
});

// 2. YARP REVERSE PROXY YAPILANDIRMASI
// Rotaları appsettings.json dosyasından okur.
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

// 3. PIPELINE YAPILANDIRMASI
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseRouting();

// CORS politikasını YARP'tan önce devreye alıyoruz
app.UseCors("GatewayCorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

// 4. GATEWAY ROTALARINI EŞLEŞTİRME
app.MapReverseProxy();

app.Run();