# 🔧 Panduan Debugging Laporan Gagal Dikirim

## 📋 Kemungkinan Penyebab Error

### 1. **Token Expired (401 Unauthenticated)**

```
[API Error] { status: 401, data: { message: "Unauthenticated." } }
```

**Solusi:**

- App akan auto logout dan redirect ke login
- Login ulang dan coba kirim laporan lagi

### 2. **Timeout (Request took too long)**

```
[FormLaporan] Error: Request failed with status code undefined
[FormLaporan] Error: ECONNABORTED
```

**Penyebab:**

- Koneksi internet lambat
- Server terlalu lama merespon
- Ukuran data terlalu besar

**Solusi:**

- Cek koneksi internet (WiFi/Data)
- Pastikan backend server berjalan
- Coba kirim lagi (timeout sudah diubah ke 30 detik)

### 3. **Validation Error (422)**

```
[API Error] {
  status: 422,
  data: {
    errors: {
      lokasi: ["Lokasi harus diisi"],
      deskripsi: ["Deskripsi minimal 10 karakter"]
    }
  }
}
```

**Solusi:**

- Pastikan semua field wajib sudah diisi
- Lokasi dan deskripsi tidak boleh kosong
- Cek validasi di backend Laravel

### 4. **Server Error (500, 503)**

```
[API Error] { status: 500, data: { message: "Internal Server Error" } }
```

**Solusi:**

- Check backend logs: `php artisan logs` atau `tail -f storage/logs/laravel.log`
- Pastikan database terkoneksi
- Restart backend: `php artisan serve`

### 5. **Network Error (No Response)**

```
[FormLaporan] Error: Network Error
[Public API Error] { message: "getaddrinfo ENOTFOUND 192.168.1.7" }
```

**Penyebab:**

- Backend tidak sedang berjalan
- IP address salah di `.env`
- Firewall memblokir koneksi

**Solusi:**

- Cek backend sudah running: `php artisan serve`
- Cek IP di `.env` file
- Test ping: `ping 192.168.1.7`

---

## 🔍 Debugging Steps

### Step 1: Lihat Console Log

Buka Expo console saat submit laporan:

```
[FormLaporan] Submitting laporan...
[FormLaporan] Error: ...
[API Error] { status: ..., data: ... }
```

### Step 2: Cek Backend Response

Di backend Laravel, test endpoint dengan curl/Postman:

```bash
curl -X POST http://192.168.1.7:8000/api/laporan \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "lokasi=Area timur" \
  -F "deskripsi=Ada lubang besar" \
  -F "klasifikasi=keselamatan"
```

### Step 3: Cek Database

```bash
# Di backend terminal
php artisan tinker

# Cek apakah data tersimpan
>>> DB::table('laporans')->latest()->first();
```

### Step 4: Cek Backend Logs

```bash
# Tail real-time logs
tail -f storage/logs/laravel.log

# Atau di tinker
>>> Log::info('test');
```

---

## ✅ Checklist Sebelum Submit

- [ ] Internet connection aktif (WiFi/Data)
- [ ] Backend server running (`php artisan serve`)
- [ ] Token valid (login fresh/baru)
- [ ] Lokasi field tidak kosong
- [ ] Deskripsi field tidak kosong
- [ ] IP backend di `.env` benar
- [ ] Database Laravel terhubung

---

## 🚀 Common Fixes

### Fix 1: Token Expired

```javascript
// Di FormLaporanScreen.js - sudah auto handled
// Jika 401, app auto logout ke login
```

### Fix 2: Timeout

- Timeout sudah diubah ke 30 detik di config.js
- Jika masih timeout, cek backend performance

### Fix 3: FormData Headers

- FormData akan auto set Content-Type: multipart/form-data
- Jangan manual set Content-Type untuk FormData

### Fix 4: Backend Route

Pastikan di Laravel `routes/api.php`:

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/laporan', [LaporanController::class, 'store']);
    Route::get('/laporan', [LaporanController::class, 'index']);
    Route::put('/laporan/{id}', [LaporanController::class, 'update']);
});
```

---

## 📞 Masih Gagal?

1. Cek console log Expo - catat error message lengkapnya
2. Cek backend logs - `tail storage/logs/laravel.log`
3. Test API dengan Postman/curl
4. Verifikasi database connection
5. Restart backend: `php artisan serve`
6. Restart Expo: `npm start`
