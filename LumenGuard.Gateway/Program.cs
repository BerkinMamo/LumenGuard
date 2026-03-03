var builder = WebApplication.CreateBuilder(args);

// YARP servislerini ekle ve konfigürasyonu appsettings'den oku
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// Gateway için de CORS gerekebilir (Frontend'in Gateway ile konuşabilmesi için)
builder.Services.AddCors(options =>
{
    options.AddPolicy("GatewayCors", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // v0 Frontend portun
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("GatewayCors");

// Gelen tüm istekleri YARP üzerinden dağıt
app.MapReverseProxy();

app.Run();