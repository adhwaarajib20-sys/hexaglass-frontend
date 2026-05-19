# 🔧 Debugging Laporan 401 Error

## 📋 Penyebab 401 pada Submit Laporan

Error 401 saat submit laporan bisa karena:

### 1. **Token Expired/Invalid**

```log
[API Error] { status: 401, data: { message: "Unauthenticated." } }
```

**Solusi:**

- Token bisa expired karena terlalu lama
- Fix: Submit laporan langsung setelah login (jangan tunggu lama)
- Atau extend token expiration di backend Laravel

### 2. **Backend Route Tidak Protected**

Jika `/laporan` endpoint tidak ada atau tidak protected

**Check di Backend Laravel (`routes/api.php`):**

```php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/laporan', [LaporanController::class, 'store']);
    Route::get('/laporan', [LaporanController::class, 'index']);
    // ... other routes
});
```

### 3. **Token Tidak Terkirim dengan Benar**

Token mungkin tidak include di Authorization header

**Check di Frontend (`src/api/config.js`):**

```javascript
// Interceptor request harus attach token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🔍 Debugging Steps

### Step 1: Check Token Tersimpan

Saat login berhasil, cek console:

```log
🔑 Token saat ini: ✅ ADA
Token (awal): eyJhbGciOiJIUzI1NiIs...
```

Jika `❌ TIDAK ADA` = token tidak tersimpan di AsyncStorage

### Step 2: Test API dengan Postman/curl

Sebelum submit via app, test langsung:

```bash
curl -X POST http://192.168.1.7:8000/api/laporan \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "lokasi=Area timur" \
  -F "deskripsi=Ada lubang" \
  -F "klasifikasi=keselamatan"
```

Jika dapat 401 → masalah di backend
Jika sukses → masalah di frontend

### Step 3: Check Backend Logs

```bash
# Terminal backend
tail -f storage/logs/laravel.log

# Cek saat submit laporan
# Lihat error apa yang muncul
```

### Step 4: Verify Sanctum Config

```bash
# Check model punya trait
php artisan tinker
>>> auth()->user()

# Check token valid
>>> auth()->check()
```

---

## 🚀 Common Fixes

### Fix 1: Token Expired

Jika token sudah tua, login ulang:

- Logout (app auto clear storage)
- Login dengan fresh token
- Submit laporan langsung

### Fix 2: Backend Route Missing

Di `routes/api.php`:

```php
// ❌ SALAH - tidak di group auth
Route::post('/laporan', [LaporanController::class, 'store']);

// ✅ BENAR
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/laporan', [LaporanController::class, 'store']);
});
```

### Fix 3: Sanctum Not Configured

```bash
# Publish Sanctum config
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Check config/sanctum.php
```

### Fix 4: CORS Issues

```php
// config/cors.php
'allowed_origins' => ['*'],
'allowed_headers' => ['*'],
'allow_credentials' => true,
```

---

## ✅ Backend Checklist

- [ ] Route `/laporan` ada di `routes/api.php`
- [ ] Route di dalam `middleware(['auth:sanctum'])` group
- [ ] `LaporanController@store` method ada
- [ ] Model `Laporan` punya fillable fields
- [ ] Database migration untuk table `laporans` sudah run
- [ ] Sanctum configured di `config/sanctum.php`
- [ ] `User` model punya `HasApiTokens` trait

---

## ✅ Frontend Checklist

- [ ] Token tersimpan di AsyncStorage setelah login
- [ ] `config.js` attach Authorization header dengan Bearer token
- [ ] `laporan.js` export `createLaporan` function
- [ ] `FormLaporanScreen.js` import `createLaporan`
- [ ] Lokasi & deskripsi field tidak kosong

---

## 📞 Jika Masih 401

1. **Test API dengan Postman/curl** - apakah endpoint benar-benar protected
2. **Check backend logs** - lihat error detail apa
3. **Check token di AsyncStorage** - apakah tersimpan
4. **Verify Sanctum** - apakah configured dengan benar
5. **Test dengan Postman** - gunakan token dari login response

Biasanya 401 adalah masalah di backend routing atau Sanctum configuration.
