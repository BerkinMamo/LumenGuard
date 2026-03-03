using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;

namespace LumenGuard.Core.Services.Hsm;

public class HsmSignatureProvider : SignatureProvider
{
    private readonly HsmService _hsmService;

    public HsmSignatureProvider(SecurityKey key, string algorithm, HsmService hsmService) 
        : base(key, algorithm) => _hsmService = hsmService;
    public override byte[] Sign(byte[] input) => _hsmService.SignData(input);

    public override bool Sign(ReadOnlySpan<byte> data, Span<byte> destination, out int bytesWritten)
    {
        var signature = _hsmService.SignData(data.ToArray());
        
        signature.AsSpan().CopyTo(destination);
        bytesWritten = signature.Length;
        
        return true;
    }

    public override bool Verify(byte[] input, byte[] signature)
    {
        var rsaKey = (RsaSecurityKey)Key;
        using var rsa = RSA.Create();
        rsa.ImportParameters(rsaKey.Parameters);
        return rsa.VerifyData(input, signature, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
    }

    protected override void Dispose(bool disposing) { }
}