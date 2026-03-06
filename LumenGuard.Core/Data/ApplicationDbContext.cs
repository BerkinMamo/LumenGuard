using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using LumenGuard.Core.Services.Crypto;
using LumenGuard.Core.Models;

namespace LumenGuard.Core.Data
{
    // 🛡️ MÜHÜR: IdentityUser tipini açıkça belirterek UserManager servisinin çözülmesini sağlıyoruz.
    public class ApplicationDbContext : IdentityDbContext<IdentityUser>
    {
        private readonly AesVaultProvider _aesProvider;

        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options, 
            AesVaultProvider aesProvider) // Singleton provider buraya enjekte edilir
            : base(options)
        {
            _aesProvider = aesProvider;
        }

        // --- Luvia Vault Tabloları ---
        public DbSet<Customer> Customers { get; set; }
        public DbSet<KycDocument> KycDocuments { get; set; }
        public DbSet<KycDetail> KycDetails { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            // Identity tablolarını (AspNetUsers vb.) mühürle
            base.OnModelCreating(builder);

            // --- Şifreleme Dönüştürücüsü (ValueConverter) ---
            // Veri tabanına giderken HSM/AES ile şifreler, gelirken çözer.
            var encryptionConverter = new ValueConverter<string, string>(
                v => string.IsNullOrEmpty(v) ? v : _aesProvider.Encrypt(v),
                v => string.IsNullOrEmpty(v) ? v : _aesProvider.Decrypt(v)
            );

            // --- Customer Yapılandırması ---
            builder.Entity<Customer>(entity =>
            {
                entity.HasIndex(e => e.ExternalRef_Hash).IsUnique(); 
                entity.HasIndex(e => e.IdentityUserId);
                
                // Hassas veriyi otomatik mühürle
                entity.Property(e => e.FullName_Enc).HasConversion(encryptionConverter);
            });

            // --- KycDetail Yapılandırması ---
            builder.Entity<KycDetail>(entity =>
            {
                entity.HasIndex(e => e.Email_Hash);
                
                // Tüm hassas kişisel veriler (PII) şifreleme katmanından geçer
                entity.Property(e => e.DateOfBirth_Enc).HasConversion(encryptionConverter);
                entity.Property(e => e.PlaceOfBirth_Enc).HasConversion(encryptionConverter);
                entity.Property(e => e.Gender_Enc).HasConversion(encryptionConverter);
                entity.Property(e => e.ExpiryDate_Enc).HasConversion(encryptionConverter);
                entity.Property(e => e.Address_Enc).HasConversion(encryptionConverter);
                entity.Property(e => e.Email_Enc).HasConversion(encryptionConverter);
                entity.Property(e => e.Phone_Enc).HasConversion(encryptionConverter);
            });

            // --- KycDocument Yapılandırması ---
            builder.Entity<KycDocument>(entity =>
            {
                // Belge anahtarlarını DB'de mühürlü sakla
                entity.Property(e => e.AesKey_Wrapped).HasConversion(encryptionConverter);
            });
        }
    }
}