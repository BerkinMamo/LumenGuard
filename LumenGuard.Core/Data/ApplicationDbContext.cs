using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using LumenGuard.Core.Services.Crypto;
using LumenGuard.Core.Models;
using System.ComponentModel.DataAnnotations;

namespace LumenGuard.Core.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        private readonly AesVaultProvider _aesProvider;

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, AesVaultProvider aesProvider)
            : base(options)
        {
            _aesProvider = aesProvider;
        }

        // --- Yeni KYC ve Customer Tabloları ---
        public DbSet<Customer> Customers { get; set; }
        public DbSet<KycDocument> KycDocuments { get; set; }
        public DbSet<KycDetail> KycDetails { get; set; }
        
        // Mevcut AuditLog yapısını koruyoruz
        public DbSet<AuditLog> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            // Identity tablolarını (AspNetUsers vb.) oluşturur
            base.OnModelCreating(builder);

            // --- Şifreleme Dönüştürücüsü (ValueConverter) ---
            // Bu converter'ı Luvia/AES ile şifrelenecek tüm modellere uygulayacağız
            var encryptionConverter = new ValueConverter<string, string>(
            v => v == null ? string.Empty : _aesProvider.Encrypt(v), // null ise boş string dön
            v => v == null ? string.Empty : _aesProvider.Decrypt(v)
            );

            // --- Customer Yapılandırması ---
            builder.Entity<Customer>(entity =>
            {
                entity.HasIndex(e => e.ExternalRef_Hash).IsUnique(); // Blind Index Arama
                entity.HasIndex(e => e.IdentityUserId); // Login Eşleşmesi
                
                // FullName_Enc alanını otomatik şifrele
                entity.Property(e => e.FullName_Enc).HasConversion(encryptionConverter);
            });

            // --- KycDetail Yapılandırması ---
            builder.Entity<KycDetail>(entity =>
            {
                entity.HasIndex(e => e.Email_Hash); // Blind Index Arama
                
                // Şifrelenecek Alanlar (ValueConverter Uygulaması)
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
                // Dosya anahtarlarını şifreleyerek sakla
                entity.Property(e => e.AesKey_Wrapped).HasConversion(encryptionConverter);
            });
        }
    }
}