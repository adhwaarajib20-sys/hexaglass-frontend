# 🔧 Panduan Memperbaiki Network Error pada Login

## 📋 Masalah

Saat login muncul error: "Network error" atau "Tidak bisa connect ke server"

## ✅ Solusi

### 1. **Identifikasi IP Backend Server Anda**

Cek di mana backend server sedang berjalan:

```bash
# Di terminal backend (Laravel/Node.js)
# Catat IP address server, contoh: 192.168.1.10 atau localhost:8000
```

### 2. **Update File `.env`**

Buka file `.env` di root project dan ubah IP-nya:

```env
# Jika backend di localhost:
EXPO_PUBLIC_API_URL=http://localhost:8000/api

# Jika backend di laptop lain di network (ganti XXX dengan IP laptop):
EXPO_PUBLIC_API_URL=http://192.168.XXX.XXX:8000/api

# Android Emulator khusus (untuk akses localhost dari emulator):
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api

# Device fisik (gunakan IP yang bisa diakses dari device):
EXPO_PUBLIC_API_URL=http://192.168.1.7:8000/api
```

### 3. **Restart Aplikasi**

Setelah mengubah `.env`, harus restart aplikasi:

```bash
# Matikan Expo development server (Ctrl+C)
npm start
# atau
expo start
```

### 4. **Verifikasi Koneksi**

Pastikan:

- ✅ Backend server sedang running
- ✅ IP address benar (sesuai dengan IP server)
- ✅ Port benar (default 8000)
- ✅ Network/WiFi device sama dengan server
- ✅ Firewall tidak memblokir koneksi

## 🐛 Debugging

Jika masih error, lihat console log Expo untuk error detail:

```
[API Error] {
  message: "...",
  status: undefined,  // Network error
  data: null,
  baseURL: "http://192.168.1.7:8000/api"
}
```

Jika `baseURL` tidak sesuai dengan IP server Anda, update file `.env`.

## 📝 Catatan

- File `.env` tidak perlu di-commit ke git
- Gunakan `.env.example` sebagai template
- Setiap developer bisa punya `.env` berbeda sesuai konfigurasi lokal mereka
