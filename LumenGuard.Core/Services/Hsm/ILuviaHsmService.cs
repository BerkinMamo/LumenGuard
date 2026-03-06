namespace LumenGuard.Core.Services.Hsm;

public interface ILuviaHsmService
{
    byte[] SignData(byte[] dataToSign);
    byte[] DecryptData(byte[] encryptedData);
    string ComputeBlindIndex(string input);
    
    bool IsHsmOnline();
    (long SlotId, string Label) GetActiveConfig();
    
    string GetManufacturer(); 
}