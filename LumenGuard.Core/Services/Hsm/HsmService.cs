using System;
using System.Runtime.InteropServices;
using Microsoft.Extensions.Configuration;

namespace LumenGuard.Core.Services.Hsm;

public interface ILuviaHsmService
{
    byte[] SignData(byte[] dataToSign);
    byte[] DecryptData(byte[] encryptedData);
    string ComputeBlindIndex(string input);
}

public class HsmService : ILuviaHsmService
{
    private readonly IConfiguration _config;

    public HsmService(IConfiguration config)
    {
        _config = config;
    }

    #region DLL Imports

    [DllImport("libluvia_hsm.so", CallingConvention = CallingConvention.Cdecl, CharSet = CharSet.Ansi)]
    private static extern bool SignWithLuviaKey(
        string pin, 
        long slotId, 
        string label, 
        byte[] data, 
        ulong dataLen, 
        byte[] signature, 
        ref ulong sigLen);

    [DllImport("libluvia_hsm.so", CallingConvention = CallingConvention.Cdecl, CharSet = CharSet.Ansi)]
    private static extern bool DecryptWithLuviaKey(
        string pin, 
        long slotId, 
        string label, 
        byte[] encryptedData, 
        ulong encryptedLen, 
        byte[] decryptedData, 
        ref ulong decryptedLen);

    [DllImport("libluvia_hsm.so", CallingConvention = CallingConvention.Cdecl, CharSet = CharSet.Ansi)]
    private static extern IntPtr Luvia_ComputeHmac(string input);

    #endregion

    public string ComputeBlindIndex(string input)
    {
        if (string.IsNullOrEmpty(input)) return string.Empty;

        // Calls the C++ function to generate a deterministic HMAC for indexing
        IntPtr ptr = Luvia_ComputeHmac(input);
        return Marshal.PtrToStringAnsi(ptr) ?? string.Empty;
    }

    public byte[] SignData(byte[] dataToSign)
    {
        var (pin, slotId, label) = GetHsmConfig();

        byte[] signature = new byte[256];
        ulong sigLen = (ulong)signature.Length;

        if (!SignWithLuviaKey(pin, slotId, label, dataToSign, (ulong)dataToSign.Length, signature, ref sigLen))
            throw new Exception($"HSM Hardware Signing failed! Check LuviaHSM logs or Slot {slotId}.");

        if (sigLen < (ulong)signature.Length)
            Array.Resize(ref signature, (int)sigLen);

        return signature;
    }

    public byte[] DecryptData(byte[] encryptedData)
    {
        var (pin, slotId, label) = GetHsmConfig();

        byte[] decryptedData = new byte[256];
        ulong decryptedLen = (ulong)decryptedData.Length;

        if (!DecryptWithLuviaKey(pin, slotId, label, encryptedData, (ulong)encryptedData.Length, decryptedData, ref decryptedLen))
            throw new Exception("HSM Hardware Decryption failed! The encrypted AES key might be invalid or corrupted.");
        
        if (decryptedLen < (ulong)decryptedData.Length)
            Array.Resize(ref decryptedData, (int)decryptedLen);

        return decryptedData;
    }

    private (string pin, long slotId, string label) GetHsmConfig()
    {
        var pin = _config["HsmConfig:Pin"];
        var slotIdRaw = _config["HsmConfig:SlotId"];
        var label = _config["HsmConfig:KeyLabel"];

        if (string.IsNullOrEmpty(pin)) throw new InvalidOperationException("LuviaHSM PIN is missing.");
        if (string.IsNullOrEmpty(slotIdRaw) || !long.TryParse(slotIdRaw, out long slotId)) throw new InvalidOperationException("LuviaHSM SlotId is invalid.");
        if (string.IsNullOrEmpty(label)) throw new InvalidOperationException("LuviaHSM KeyLabel is missing.");

        return (pin, slotId, label);
    }
}