using Microsoft.IdentityModel.Tokens;
using LumenGuard.Core.Services.Hsm;

namespace LumenGuard.Core.Services.Hsm
{
    public class HsmCryptoProviderFactory : CryptoProviderFactory
    {
        private readonly HsmService _hsmService;

        public HsmCryptoProviderFactory(HsmService hsmService)
        {
            _hsmService = hsmService;
        }

        /// <summary>
        /// OpenIddict imzalama işlemi için bir provider istediğinde tetiklenir.
        /// </summary>
        public override SignatureProvider CreateForSigning(SecurityKey key, string algorithm)
        {
            // Program.cs'de tanımladığımız KeyId ile eşleşme kontrolü yapıyoruz
            if (key.KeyId == "Luvia-HSM-Key-01")
            {
                // Standart imzalayıcı yerine bizim özel HSM imzalayıcımızı döndürüyoruz
                return new HsmSignatureProvider(key, algorithm, _hsmService);
            }

            // Diğer anahtarlar (varsa) için varsayılan .NET davranışını kullan
            return base.CreateForSigning(key, algorithm);
        }

        /// <summary>
        /// Özel provider'ların önbelleğe alınmamasını sağlar (Güvenlik için her seferinde yeni veya kontrollü üretim)
        /// </summary>
        public override bool IsSupportedAlgorithm(string algorithm, SecurityKey key)
        {
            return base.IsSupportedAlgorithm(algorithm, key) || (key.KeyId == "Luvia-HSM-Key-01" && algorithm == SecurityAlgorithms.RsaSha256);
        }
    }
}