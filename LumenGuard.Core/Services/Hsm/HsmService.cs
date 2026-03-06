using System;
using System.Runtime.InteropServices;
using Microsoft.Extensions.Configuration;
using System.Linq;

namespace LumenGuard.Core.Services.Hsm;

public class HsmService : ILuviaHsmService
{
    private readonly IConfiguration _config;
    private const string LibraryName = "libluvia_hsm.so";

    public HsmService(IConfiguration config)
    {
        _config = config;
    }

    #region DLL Imports

    [DllImport(LibraryName, CallingConvention = CallingConvention.Cdecl, CharSet = CharSet.Ansi)]
    private static extern bool SignWithLuviaKey(
        string pin, 
        long slotId, 
        string label, 
        byte[] data, 
        ulong dataLen, 
        byte[] signature, 
        ref ulong sigLen);

    [DllImport(LibraryName, CallingConvention = CallingConvention.Cdecl, CharSet = CharSet.Ansi)]
    private static extern bool DecryptWithLuviaKey(
        string pin, 
        long slotId, 
        string label, 
        byte[] encryptedData, 
        ulong encryptedLen, 
        byte[] decryptedData, 
        ref ulong decryptedLen);

    [DllImport(LibraryName, CallingConvention = CallingConvention.Cdecl, CharSet = CharSet.Ansi)]
    private static extern IntPtr Luvia_ComputeHmac(string input);

    [DllImport(LibraryName, CallingConvention = CallingConvention.Cdecl, CharSet = CharSet.Ansi)]
    private static extern IntPtr Luvia_GetManufacturer();

    #endregion

    public string GetManufacturer()
    {
        try
        {
            IntPtr ptr = Luvia_GetManufacturer();
            if (ptr == IntPtr.Zero) return "Unknown Manufacturer";

            // Pointer'daki veriyi C# string'ine mühürle
            return Marshal.PtrToStringAnsi(ptr) ?? "Unknown Manufacturer";
        }
        catch
        {
            return "Luvia-HSM";
        }
    }

    public bool IsHsmOnline()
    {
        try
        {
            var testData = System.Text.Encoding.UTF8.GetBytes("ping");
            var result = SignData(testData);
            return result != null && result.Length > 0;
        }
        catch
        {
            return false;
        }
    }

    public (long SlotId, string Label) GetActiveConfig()
    {
        var config = GetHsmConfig();
        return (config.slotId, config.label);
    }

    public string ComputeBlindIndex(string input)
    {
        if (string.IsNullOrEmpty(input)) return string.Empty;

        try 
        {
            IntPtr ptr = Luvia_ComputeHmac(input);
            if (ptr == IntPtr.Zero) return string.Empty;
            
            return Marshal.PtrToStringAnsi(ptr) ?? string.Empty;
        }
        catch (Exception ex)
        {
            throw new Exception("Luvia_ComputeHmac failed.", ex);
        }
    }

    public byte[] SignData(byte[] dataToSign)
    {
        if (dataToSign == null || dataToSign.Length == 0) return Array.Empty<byte>();
        
        var (pin, slotId, label) = GetHsmConfig();
        byte[] signature = new byte[512]; 
        ulong sigLen = (ulong)signature.Length;

        bool success = SignWithLuviaKey(pin, slotId, label, dataToSign, (ulong)dataToSign.Length, signature, ref sigLen);

        if (!success)
            throw new Exception($"HSM Hardware Signing failed! Slot: {slotId}");

        if (sigLen < (ulong)signature.Length)
            Array.Resize(ref signature, (int)sigLen);

        return signature;
    }

    public byte[] DecryptData(byte[] encryptedData)
    {
        if (encryptedData == null || encryptedData.Length == 0) return Array.Empty<byte>();

        var (pin, slotId, label) = GetHsmConfig();
        byte[] decryptedData = new byte[encryptedData.Length]; 
        ulong decryptedLen = (ulong)decryptedData.Length;

        bool success = DecryptWithLuviaKey(pin, slotId, label, encryptedData, (ulong)encryptedData.Length, decryptedData, ref decryptedLen);

        if (!success)
            throw new Exception("HSM Hardware Decryption failed!");
        
        if (decryptedLen < (ulong)decryptedData.Length)
            Array.Resize(ref decryptedData, (int)decryptedLen);

        return decryptedData;
    }

    private (string pin, long slotId, string label) GetHsmConfig()
    {
        var pin = _config["HsmConfig:Pin"];
        var slotIdRaw = _config["HsmConfig:SlotId"];
        var label = _config["HsmConfig:KeyLabel"];

        if (string.IsNullOrEmpty(pin) || string.IsNullOrEmpty(slotIdRaw) || !long.TryParse(slotIdRaw, out long slotId) || string.IsNullOrEmpty(label))
            throw new InvalidOperationException("HSM Configuration is incomplete in appsettings.json");

        return (pin, slotId, label);
    }
}