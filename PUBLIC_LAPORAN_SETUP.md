# 📱 Setup Public API untuk Supir (Tanpa Login)

## Overview

Frontend sudah siap untuk supir membuat laporan **tanpa login dan tanpa token**.
Sekarang Anda perlu setup backend API untuk support ini.

---

## 🔧 Backend Setup (Laravel)

### Step 1: Buat Public Route

Di file `routes/api.php`, tambahkan route PUBLIC untuk supir:

```php
// 📍 PUBLIC ROUTES - Tidak perlu auth
Route::group(['middleware' => 'api'], function () {
    // Supir - Create laporan tanpa login
    Route::post('/laporan', [LaporanController::class, 'store']);

    // Optional: read laporan public
    Route::get('/laporan', [LaporanController::class, 'index']);
});

// 🔒 PROTECTED ROUTES - Perlu auth token
Route::middleware('auth:sanctum')->group(function () {
    // Admin/Operator routes
    Route::get('/laporan/{id}', [LaporanController::class, 'show']);
    Route::put('/laporan/{id}', [LaporanController::class, 'update']);
    Route::post('/laporan/{id}/verifikasi', [LaporanController::class, 'verifikasi']);
    Route::delete('/laporan/{id}', [LaporanController::class, 'destroy']);
});
```

### Step 2: Update LaporanController

Pastikan method `store()` bisa handle public request:

```php
public function store(Request $request)
{
    // Validasi
    $validated = $request->validate([
        'nama_pelapor' => 'required|string|max:255',
        'lokasi' => 'required|string',
        'deskripsi' => 'required|string',
        'klasifikasi' => 'required|in:keselamatan,lingkungan,kualitas,prosedur,lainnya',
        'tanggal_kejadian' => 'required|date',
        'waktu_kejadian' => 'required|date_format:H:i:s',
        'perusahaan' => 'nullable|string',
        'rekomendasi' => 'nullable|string',
    ]);

    // Create laporan
    $laporan = Laporan::create($validated);

    return response()->json([
        'success' => true,
        'message' => 'Laporan berhasil disimpan',
        'data' => $laporan,
    ], 201);
}
```

### Step 3: Setup CORS (Jika diperlukan)

Di `config/cors.php`:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['*'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => false,
```

---

## 🧪 Test Backend

Sebelum test frontend, test API dulu dengan curl:

```bash
# Test POST laporan public
curl -X POST http://192.168.1.7:8000/api/laporan \
  -H "Content-Type: application/json" \
  -d '{
    "nama_pelapor": "Supir Test",
    "lokasi": "Area Timur",
    "deskripsi": "Ada lubang besar",
    "klasifikasi": "keselamatan",
    "tanggal_kejadian": "2026-05-03",
    "waktu_kejadian": "14:30:00"
  }'

# Respons harusnya 201 Created
```

---

## 🚀 Frontend Update (Sudah Done)

Frontend sudah di-update dengan:

- ✅ `createLaporanPublic()` - gunakan `publicApi` (no token)
- ✅ FormLaporanScreen - tidak require token
- ✅ No login redirect
- ✅ No auth check

---

## ✅ Checklist

**Backend:**

- [ ] Route `/api/laporan` POST adalah public (tidak di dalam `middleware('auth:sanctum')`)
- [ ] `LaporanController@store()` method ada dan bisa handle public requests
- [ ] Database table `laporans` sudah ada
- [ ] Model `Laporan` punya `$fillable` fields
- [ ] CORS configured dengan benar

**Frontend:**

- [x] `createLaporanPublic()` export ada di `api/laporan.js`
- [x] FormLaporanScreen gunakan `createLaporanPublic`
- [x] No token requirement
- [x] No login redirect

---

## 🔍 Debugging

### Jika dapat 404 Not Found

- Cek route `/api/laporan` POST ada di `routes/api.php`
- Cek tidak ada typo di route name

### Jika dapat 405 Method Not Allowed

- Cek method adalah POST (bukan GET)
- Cek route tidak protected dengan middleware yang salah

### Jika dapat 422 Validation Error

- Cek field yang dikirim sesuai dengan validation rules
- Lihat error detail di response: `{ "errors": { "field": [...] } }`

### Jika dapat CORS error

- Check `config/cors.php` configured dengan benar
- Atau run: `php artisan config:cache`

---

## 📝 Flow Supir Create Laporan

1. **Frontend:** Supir buka halaman "Buat Laporan"
2. **Frontend:** Isi form (lokasi, deskripsi, dll)
3. **Frontend:** Klik "Kirim"
4. **Frontend:** Call `createLaporanPublic(formData)` → POST ke `/api/laporan`
5. **Backend:** Terima request (public, no auth check)
6. **Backend:** Validasi data → Create record di database
7. **Backend:** Return 201 Created + laporan data
8. **Frontend:** Show "✅ Laporan berhasil dikirim"
9. **Frontend:** Clear form

**Selesai!** Supir tidak perlu login, langsung bisa buat laporan! ✅
