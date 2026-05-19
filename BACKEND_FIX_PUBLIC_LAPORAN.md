# 🔧 Fix Backend untuk Public Laporan Endpoint

## 📋 Masalah

Supir mendapat 401 "Unauthenticated" saat membuat laporan.
Frontend sudah benar (menggunakan `publicApi` tanpa token), tapi backend masih protect endpoint dengan auth.

## ✅ Solusi Backend

### Step 1: Buka `routes/api.php`

File backend: `C:\laragon\www\hexaglass-backend\routes\api.php`

### Step 2: Update Routes

**Cari line yang ada `/laporan`** dan pastikan route POST adalah PUBLIC:

#### ❌ SALAH (Protected)

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/laporan', [LaporanController::class, 'store']);
    // ...
});
```

#### ✅ BENAR (Public)

```php
// PUBLIC ROUTES - Supir buat laporan tanpa login
Route::post('/laporan', [LaporanController::class, 'store']);

// PROTECTED ROUTES - Perlu token
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/laporan', [LaporanController::class, 'index']); // Only admin/operator
    Route::get('/laporan/{id}', [LaporanController::class, 'show']);
    Route::put('/laporan/{id}', [LaporanController::class, 'update']);
    Route::post('/laporan/{id}/verifikasi', [LaporanController::class, 'verifikasi']);
    Route::delete('/laporan/{id}', [LaporanController::class, 'destroy']);
});
```

### Step 3: Contoh Route File Lengkap

```php
<?php

use App\Http\Controllers\Api\{
    AuthController,
    LaporanController,
    AntreanController,
    DashboardController,
    UserController,
};
use Illuminate\Support\Facades\Route;

// PUBLIC ROUTES - Tidak perlu auth token
Route::post('/laporan', [LaporanController::class, 'store']);

// Auth routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// PROTECTED ROUTES - Perlu auth:sanctum middleware
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Laporan (read & admin actions)
    Route::get('/laporan', [LaporanController::class, 'index']);
    Route::get('/laporan/{id}', [LaporanController::class, 'show']);
    Route::put('/laporan/{id}', [LaporanController::class, 'update']);
    Route::post('/laporan/{id}/verifikasi', [LaporanController::class, 'verifikasi']);
    Route::delete('/laporan/{id}', [LaporanController::class, 'destroy']);

    // Antrean, Dashboard, Users (protected routes)
    Route::get('/antrean', [AntreanController::class, 'index']);
    Route::get('/antrean/{id}', [AntreanController::class, 'show']);
    Route::put('/antrean/{id}/status', [AntreanController::class, 'updateStatus']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::apiResource('/users', UserController::class);
});
```

### Step 4: Update LaporanController

Pastikan method `store()` bisa handle public request (tanpa auth check):

```php
public function store(Request $request)
{
    // Validasi input
    $validated = $request->validate([
        'nama_pelapor' => 'required|string|max:255',
        'lokasi' => 'required|string|max:255',
        'deskripsi' => 'required|string',
        'klasifikasi' => 'required|in:keselamatan,lingkungan,kualitas,prosedur,lainnya',
        'tanggal_kejadian' => 'required|date',
        'waktu_kejadian' => 'required|date_format:H:i:s',
        'perusahaan' => 'nullable|string|max:255',
        'rekomendasi' => 'nullable|string',
    ]);

    try {
        // Create laporan
        $laporan = Laporan::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Laporan berhasil disimpan',
            'data' => $laporan,
        ], 201);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Gagal menyimpan laporan: ' . $e->getMessage(),
        ], 500);
    }
}
```

### Step 5: Clear Cache & Restart

```bash
# Backend terminal
php artisan config:cache
php artisan cache:clear

# Restart Laravel
php artisan serve
```

---

## 🧪 Test Backend

Sebelum test dari frontend, test API dulu dengan curl:

```bash
# Test POST laporan PUBLIC
curl -X POST http://192.168.1.7:8000/api/laporan \
  -H "Content-Type: application/json" \
  -d '{
    "nama_pelapor": "Supir Test",
    "lokasi": "Area Timur",
    "deskripsi": "Ada lubang besar di jalan",
    "klasifikasi": "keselamatan",
    "tanggal_kejadian": "2026-05-03",
    "waktu_kejadian": "14:30:00",
    "perusahaan": "PT Test"
  }'

# Respons harusnya:
# HTTP 201 Created
# {
#   "success": true,
#   "message": "Laporan berhasil disimpan",
#   "data": { ... }
# }
```

### Jika dapat 401

- Backend route `/api/laporan` POST masih dalam middleware auth:sanctum
- Pindahkan route di luar middleware auth

### Jika dapat 422 Validation Error

- Check field mana yang invalid
- Update request data sesuai validation rules

### Jika dapat 500 Server Error

- Check backend logs: `tail -f storage/logs/laravel.log`
- Verify database connection
- Verify `Laporan` model fillable fields

---

## ✅ Backend Checklist

- [ ] Route `POST /api/laporan` adalah PUBLIC (tidak dalam middleware auth:sanctum)
- [ ] Route `POST /api/laporan` di luar protected group
- [ ] `LaporanController@store()` method ada dan tidak check auth
- [ ] Model `Laporan` punya `$fillable` dengan semua fields
- [ ] Database table `laporans` sudah ada
- [ ] Migration sudah di-run: `php artisan migrate`
- [ ] Cache cleared: `php artisan config:cache`

---

## 📝 Next Steps

1. **Update backend `routes/api.php`** - Pindahkan POST /laporan ke PUBLIC
2. **Update LaporanController@store()** - Pastikan bisa handle public requests
3. **Clear cache & restart**: `php artisan config:cache && php artisan serve`
4. **Test dengan curl** - Verifikasi endpoint bisa diakses tanpa token
5. **Test dari frontend** - Supir bisa submit laporan

Setelah backend fixed, frontend akan auto bisa submit laporan! ✅
