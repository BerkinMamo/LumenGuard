using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using LumenGuard.Api.Services.Crypto;
using System.ComponentModel.DataAnnotations;

namespace LumenGuard.Api.Data
{

    public class ApplicationDbContext : IdentityDbContext
    {
        private readonly AesVaultProvider _aesProvider;

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, AesVaultProvider aesProvider)
            : base(options)
        {
            _aesProvider = aesProvider;
        }

        public DbSet<VaultSecret> VaultSecrets { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            var encryptionConverter = new ValueConverter<string, string>(
                v => v == null ? null : _aesProvider.Encrypt(v),
                v => v == null ? null : _aesProvider.Decrypt(v)
            );


            builder.Entity<VaultSecret>()
                .Property(e => e.SecretValue)
                .HasConversion(encryptionConverter);


        }
    }


    public class VaultSecret
    {
        public int Id { get; set; }
        [Required]
        public string SecretName { get; set; } = null!;
        [Required]
        public string SecretValue { get; set; } = null!;
    }
}