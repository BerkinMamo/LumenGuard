#include "lib/pkcs11.h"
#include <dlfcn.h>
#include <string>
#include <cstring>

extern "C" {
    bool SignWithLuviaKey(const char* pin, long slotID, const char* label, 
                         const unsigned char* data, unsigned long dataLen, 
                         unsigned char* signature, unsigned long* sigLen) {
        
        void* handle = dlopen("/usr/local/lib/softhsm/libsofthsm2.so", RTLD_NOW);
        if (!handle) return false;

        CK_C_GetFunctionList getFnList = (CK_C_GetFunctionList)dlsym(handle, "C_GetFunctionList");
        CK_FUNCTION_LIST_PTR p11;
        getFnList(&p11);

        if (p11->C_Initialize(NULL_PTR) != CKR_OK) return false;

        CK_SESSION_HANDLE hSession;
        if (p11->C_OpenSession((CK_SLOT_ID)slotID, CKF_SERIAL_SESSION | CKF_RW_SESSION, NULL_PTR, NULL_PTR, &hSession) != CKR_OK) return false;
        if (p11->C_Login(hSession, CKU_USER, (CK_UTF8CHAR_PTR)pin, (CK_ULONG)strlen(pin)) != CKR_OK) return false;

        CK_OBJECT_CLASS keyClass = CKO_PRIVATE_KEY;
        CK_OBJECT_HANDLE hKey;
        CK_ATTRIBUTE template_key[] = {
            {CKA_LABEL, (void*)label, (CK_ULONG)strlen(label)},
            {CKA_CLASS, &keyClass, sizeof(keyClass)}
        };

        CK_ULONG objCount;
        p11->C_FindObjectsInit(hSession, template_key, 2);
        p11->C_FindObjects(hSession, &hKey, 1, &objCount);
        p11->C_FindObjectsFinal(hSession);

        if (objCount == 0) {
            p11->C_Logout(hSession);
            p11->C_CloseSession(hSession);
            return false;
        }

        CK_MECHANISM mechanism = { CKM_SHA256_RSA_PKCS, NULL_PTR, 0 };
        if (p11->C_SignInit(hSession, &mechanism, hKey) != CKR_OK) return false;
        if (p11->C_Sign(hSession, (CK_BYTE_PTR)data, dataLen, signature, sigLen) != CKR_OK) return false;

        p11->C_Logout(hSession);
        p11->C_CloseSession(hSession);
        p11->C_Finalize(NULL_PTR);
        
        return true;
    }

    bool DecryptWithLuviaKey(const char* pin, long slotID, const char* label,
                             const unsigned char* encryptedData, unsigned long encryptedLen,
                             unsigned char* decryptedData, unsigned long* decryptedLen) {
        
        void* handle = dlopen("/usr/local/lib/softhsm/libsofthsm2.so", RTLD_NOW);
        if (!handle) return false;

        CK_C_GetFunctionList getFnList = (CK_C_GetFunctionList)dlsym(handle, "C_GetFunctionList");
        CK_FUNCTION_LIST_PTR p11;
        getFnList(&p11);

        if (p11->C_Initialize(NULL_PTR) != CKR_OK) return false;

        CK_SESSION_HANDLE hSession;
        if (p11->C_OpenSession((CK_SLOT_ID)slotID, CKF_SERIAL_SESSION | CKF_RW_SESSION, NULL_PTR, NULL_PTR, &hSession) != CKR_OK) return false;
        if (p11->C_Login(hSession, CKU_USER, (CK_UTF8CHAR_PTR)pin, (CK_ULONG)strlen(pin)) != CKR_OK) return false;
        CK_OBJECT_CLASS keyClass = CKO_PRIVATE_KEY;
        CK_OBJECT_HANDLE hKey;
        CK_ATTRIBUTE template_key[] = {
            {CKA_LABEL, (void*)label, (CK_ULONG)strlen(label)},
            {CKA_CLASS, &keyClass, sizeof(keyClass)}
        };

        CK_ULONG objCount;
        p11->C_FindObjectsInit(hSession, template_key, 2);
        p11->C_FindObjects(hSession, &hKey, 1, &objCount);
        p11->C_FindObjectsFinal(hSession);

        if (objCount == 0) {
            p11->C_Logout(hSession);
            p11->C_CloseSession(hSession);
            return false;
        }
        CK_MECHANISM mechanism = { CKM_RSA_PKCS, NULL_PTR, 0 };
        if (p11->C_DecryptInit(hSession, &mechanism, hKey) != CKR_OK) return false;
        if (p11->C_Decrypt(hSession, (CK_BYTE_PTR)encryptedData, encryptedLen, decryptedData, decryptedLen) != CKR_OK) return false;

        p11->C_Logout(hSession);
        p11->C_CloseSession(hSession);
        p11->C_Finalize(NULL_PTR);
        
        return true;
    }
}