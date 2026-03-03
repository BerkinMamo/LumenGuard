using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using LumenGuard.Api.Services.Crypto;

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
                v => _aesProvider.Encrypt(v),
                v => _aesProvider.Decrypt(v)
            );


            builder.Entity<VaultSecret>()
                .Property(e => e.SecretValue)
                .HasConversion(encryptionConverter);


        }
    }


    public class VaultSecret
    {
        public int Id { get; set; }
        public string SecretName { get; set; }
        public string SecretValue { get; set; }
    }
}