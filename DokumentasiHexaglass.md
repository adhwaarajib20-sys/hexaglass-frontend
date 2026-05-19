# DOKUMENTASI PROJECT HEXAGLASS

## Sistem Antrean Pengisian Gas - PT Migas Hilir Jabar

---

## TECH STACK

- **Backend**: Laravel 13 (PHP)
- **Frontend**: React Native + Expo SDK 54
- **Database**: MySQL
- **Auth**: Laravel Sanctum
- **Role Management**: Spatie Permission

---

## STRUKTUR FOLDER

### BACKEND: `C:\laragon\www\hexaglass-backend`

```
hexaglass-backend/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── Api/
│   │           ├── AuthController.php
│   │           ├── AntreanController.php
│   │           ├── SesiAntreanController.php
│   │           ├── LaporanController.php
│   │           ├── UserController.php
│   │           ├── DashboardController.php
│   │           ├── SupirController.php
│   │           ├── LaporanPengisianController.php        ← BARU
│   │           └── InformasiPerusahaanController.php     ← BARU
│   └── Models/
│       ├── User.php
│       ├── Antrean.php
│       ├── Kendaraan.php
│       ├── SesiAntrean.php
│       ├── Laporan.php
│       ├── LaporanFoto.php
│       ├── LaporanPengisian.php                          ← BARU
│       └── InformasiPerusahaan.php                      ← BARU
├── database/
│   └── migrations/
│       ├── 0001_01_01_000000_create_users_table.php
│       ├── 2026_04_30_021547_create_personal_access_tokens_table.php
│       ├── 2026_04_30_021603_create_permission_tables.php
│       ├── 2026_04_30_022437_add_columns_to_users_table.php
│       ├── 2026_04_30_022910_create_kendaraan_table.php
│       ├── 2026_04_30_022958_create_antrean_table.php
│       ├── 2026_04_30_023054_create_laporan_table.php
│       ├── 2026_04_30_062618_revamp_kendaraan_table.php
│       ├── 2026_04_30_062637_create_sesi_antrean_table.php
│       ├── 2026_05_xx_add_validasi_satpam_to_antrean_table.php
│       ├── 2026_05_06_062351_add_fields_to_antrean_table.php  ← BARU
│       ├── 2026_05_06_062352_create_laporan_pengisian_table.php ← BARU
│       └── 2026_05_06_062352_create_informasi_perusahaan_table.php ← BARU
└── routes/
    └── api.php
```

### FRONTEND: `C:\laragon\www\hexaglass-frontend`

```
hexaglass-frontend/
├── app/
│   ├── _layout.tsx                    ← Root layout dengan AuthProvider
│   ├── index.tsx                      ← Redirect berdasarkan role
│   ├── login.tsx                      ← Halaman login
│   ├── modal.tsx
│   ├── admin/
│   │   ├── _layout.tsx                ← Tab navigator admin
│   │   ├── dashboard.tsx
│   │   ├── antrean.tsx
│   │   ├── laporan.tsx
│   │   └── users.tsx
│   ├── operator/
│   │   ├── _layout.tsx
│   │   ├── antrean.tsx
│   │   └── laporan.tsx
│   ├── satpam/
│   │   ├── _layout.tsx
│   │   ├── qr.tsx
│   │   ├── validasi.tsx
│   │   └── antrean.tsx
│   └── supir/
│       ├── _layout.tsx
│       ├── scan.tsx
│       ├── antrean.tsx
│       ├── laporan.tsx
│       └── form-laporan.tsx
├── src/
│   ├── api/
│   │   ├── config.js                  ← Axios instance + storage helper
│   │   ├── auth.js                    ← Login, logout, me
│   │   ├── antrean.js                 ← CRUD antrean + estimasi + prioritas + pengisian
│   │   ├── sesi.js                    ← Generate barcode, scan QR, status
│   │   ├── laporan.js                 ← CRUD laporan ketidaksesuaian
│   │   ├── user.js                    ← CRUD user management
│   │   ├── dashboard.js               ← Dashboard statistik
│   │   ├── perusahaan.js              ← CRUD informasi perusahaan ← BARU
│   │   └── laporanPengisian.js        ← Laporan pengisian gas ← BARU
│   ├── components/
│   │   └── UI.js                      ← Komponen global (Button, Card, Header, Badge, dll)
│   ├── constants/
│   │   └── theme.js                   ← Colors, Typography, Spacing, Radius, Shadow
│   ├── context/
│   │   └── AuthContext.js             ← Auth state management
│   ├── screens/
│   │   ├── auth/
│   │   │   └── LoginScreen.js
│   │   ├── admin/
│   │   │   ├── DashboardScreen.js
│   │   │   ├── AntreanScreen.js       ← PERLU DIUPDATE
│   │   │   ├── LaporanScreen.js
│   │   │   ├── UserScreen.js
│   │   │   └── PerusahaanScreen.js    ← PERLU DIBUAT
│   │   ├── operator/
│   │   │   ├── AntreanScreen.js       ← PERLU DIUPDATE (fitur baru)
│   │   │   └── LaporanScreen.js       ← PERLU DIUPDATE
│   │   ├── satpam/
│   │   │   ├── QRScreen.js
│   │   │   ├── ValidasiScreen.js
│   │   │   └── AntreanScreen.js       ← PERLU DIUPDATE
│   │   └── supir/
│   │       ├── ScanScreen.js          ← PERLU DIUPDATE
│   │       ├── StatusAntreanScreen.js ← PERLU DIUPDATE
│   │       ├── LaporanScreen.js
│   │       └── FormLaporanScreen.js   ← PERLU DIUPDATE
│   └── utils/
│       ├── storage.js                 ← SecureStore wrapper
│       └── helpers.js                 ← Format tanggal, waktu, status
└── assets/
    └── images/
        └── logo.png                   ← Logo PT Migas Hilir Jabar
```

---

## DATABASE SCHEMA

### Tabel: `users`

```
id, name, email, password, no_hp, status (aktif/nonaktif), role,
email_verified_at, remember_token, created_at, updated_at
```

### Tabel: `kendaraan`

```
id, user_id (FK users), nama_supir, no_hp_supir,
nomor_polisi (unique), jenis_kendaraan, kapasitas_tangki,
perusahaan, status_validasi (pending/valid/ditolak),
created_at, updated_at
```

### Tabel: `sesi_antrean`

```
id, satpam_id (FK users), qr_code (unique), qr_token (unique),
status (aktif/digunakan/kadaluarsa), expired_at,
kendaraan_id (FK), antrean_id (FK), created_at, updated_at
```

### Tabel: `antrean`

```
id, kendaraan_id (FK), operator_id (FK users), satpam_id (FK users),
nomor_antrean, tanggal, status (menunggu/dipanggil/dilayani/selesai/batal),
status_validasi_satpam (menunggu_validasi/disetujui/ditolak),
prioritas (normal/tinggi), is_prioritas (boolean), alasan_prioritas,
waktu_daftar, waktu_dipanggil, waktu_selesai,
estimasi_menit, estimasi_selesai,
jumlah_gas_liter, catatan_pengisian,
informasi_perusahaan_id (FK), keterangan, alasan_penolakan,
created_at, updated_at
```

### Tabel: `laporan` (Ketidaksesuaian)

```
id, pelapor_id (FK users), verifikator_id (FK users),
nama_pelapor, perusahaan, tanggal_kejadian, waktu_kejadian,
lokasi, klasifikasi (keselamatan/lingkungan/kualitas/prosedur/lainnya),
deskripsi, rekomendasi, status (draft/terkirim/diverifikasi/ditolak),
catatan_admin, deleted_at, created_at, updated_at
```

### Tabel: `laporan_foto`

```
id, laporan_id (FK), path_foto, keterangan_foto, created_at, updated_at
```

### Tabel: `laporan_pengisian` ← BARU

```
id, antrean_id (FK), kendaraan_id (FK), operator_id (FK users),
tanggal, jumlah_gas_liter, durasi_menit, estimasi_menit,
is_prioritas (boolean), alasan_prioritas, catatan,
status (selesai/batal), created_at, updated_at
```

### Tabel: `informasi_perusahaan` ← BARU

```
id, nama_perusahaan, is_prioritas (boolean),
volume, rencana_pengisian_harian, keterangan,
status (aktif/nonaktif), created_by (FK users),
created_at, updated_at
```

---

## API ROUTES LENGKAP

### Public (Tanpa Auth)

```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/supir/validasi-barcode
POST   /api/supir/daftar-antrean
GET    /api/supir/status-antrean/{kode}
```

### Protected (Butuh Bearer Token)

```
# Auth
POST   /api/auth/logout
GET    /api/auth/me

# Sesi Barcode (Satpam)
POST   /api/sesi/generate-barcode
GET    /api/sesi/status-barcode

# Satpam
GET    /api/satpam/antrean-pending
POST   /api/satpam/validasi/{id}

# Antrean
GET    /api/antrean
GET    /api/antrean/panggil-berikutnya
GET    /api/antrean/{id}
PUT    /api/antrean/{id}/status
PUT    /api/antrean/{id}/estimasi          ← BARU
PUT    /api/antrean/{id}/prioritas         ← BARU
POST   /api/antrean/{id}/selesai-pengisian ← BARU

# Laporan Ketidaksesuaian
GET    /api/laporan
POST   /api/laporan
GET    /api/laporan/{id}
POST   /api/laporan/{id}/verifikasi
DELETE /api/laporan/{id}

# Laporan Pengisian ← BARU
GET    /api/laporan-pengisian
GET    /api/laporan-pengisian/statistik
GET    /api/laporan-pengisian/{id}

# Informasi Perusahaan ← BARU
GET    /api/perusahaan
POST   /api/perusahaan
GET    /api/perusahaan/{id}
PUT    /api/perusahaan/{id}
DELETE /api/perusahaan/{id}

# User Management
GET    /api/users
POST   /api/users
GET    /api/users/{id}
PUT    /api/users/{id}
DELETE /api/users/{id}
POST   /api/users/{id}/reset-password
PATCH  /api/users/{id}/toggle-status

# Dashboard
GET    /api/dashboard
GET    /api/dashboard/rekap
```

---

## ROLE & AKSES

| Role     | Akses Utama                                                                   |
| -------- | ----------------------------------------------------------------------------- |
| Admin    | Dashboard, semua antrean, verifikasi laporan, kelola user, CRUD perusahaan    |
| Operator | Kelola antrean, input estimasi, prioritas, hasil pengisian, laporan pengisian |
| Satpam   | Generate barcode, validasi antrean supir, monitor antrean                     |
| Supir    | Scan barcode, input data kendaraan, cek status antrean, buat laporan          |

---

## ALUR SISTEM

```
1. SATPAM generate barcode (QR Code muncul di layar)
2. SUPIR scan barcode / input kode manual
3. SUPIR isi form data kendaraan
4. Sistem buat nomor antrean otomatis → status: menunggu_validasi
5. SATPAM validasi data supir (setujui/tolak)
6. Jika disetujui → status antrean: menunggu
7. OPERATOR panggil antrean berikutnya
8. OPERATOR set estimasi waktu pengisian
9. OPERATOR set prioritas (jika perlu)
10. Proses pengisian berlangsung → status: dilayani
11. OPERATOR input jumlah gas & selesaikan pengisian
12. Sistem otomatis buat laporan pengisian
13. SUPIR bisa lihat hasil pengisian di status antrean
14. ADMIN monitor semua data di dashboard
```

---

## DESIGN SYSTEM (TEMA WARNA)

```javascript
// src/constants/theme.js
Colors = {
  primary: "#1a7a2e", // Hijau utama (dari logo)
  primaryDark: "#145c22",
  primaryLight: "#e8f5ec",
  accent: "#e8650a", // Orange (dari logo)
  accentLight: "#fff3ec",
  success: "#16a34a",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  background: "#f5f7f5",
  white: "#ffffff",
  textPrimary: "#1a2e1a",
  textSecondary: "#6b7280",
};
```

---

## KOMPONEN UI GLOBAL

File: `src/components/UI.js`

Komponen yang tersedia:

- `Button` - variant: primary, secondary, accent, danger, success, ghost
- `Card` - wrapper dengan shadow
- `Header` - header dengan logo dan tombol logout
- `Badge` - label berwarna
- `StatusBadge` - badge untuk status antrean/validasi/laporan
- `EmptyState` - tampilan kosong
- `LogoutButton` - tombol logout di header
- `Divider` - garis pemisah dengan label
- `LoadingScreen` - loading indicator fullscreen

---

## STORAGE (TOKEN MANAGEMENT)

File: `src/utils/storage.js`

Menggunakan `expo-secure-store` untuk native dan `localStorage` untuk web.
Digunakan di `AuthContext.js` dan `config.js`.

---

## YANG MASIH PERLU DIKERJAKAN

### Frontend - Screen yang perlu dibuat/diupdate:

1. **`src/screens/admin/AntreanScreen.js`** - Monitor antrean + lihat laporan pengisian
2. **`src/screens/admin/PerusahaanScreen.js`** - CRUD informasi perusahaan (BELUM ADA)
3. **`app/admin/perusahaan.tsx`** - Route untuk perusahaan (BELUM ADA)
4. **`src/screens/operator/AntreanScreen.js`** - Tambah fitur: estimasi, prioritas, input gas
5. **`src/screens/operator/LaporanScreen.js`** - Lihat laporan pengisian
6. **`src/screens/satpam/AntreanScreen.js`** - Monitor antrean real-time
7. **`src/screens/supir/ScanScreen.js`** - Update design system baru
8. **`src/screens/supir/StatusAntreanScreen.js`** - Tampilkan estimasi, prioritas, hasil gas
9. **`src/screens/supir/FormLaporanScreen.js`** - Update design system baru

### Backend - Yang sudah selesai:

- ✅ Migration semua tabel
- ✅ Model semua
- ✅ Controller semua
- ✅ Routes semua

---

## CARA MENJALANKAN PROJECT

### Backend:

```bash
cd C:\laragon\www\hexaglass-backend
php artisan serve --host=0.0.0.0 --port=8000
```

### Frontend:

```bash
cd C:\laragon\www\hexaglass-frontend
npx expo start --clear
```

### Cek IP (wajib sama di config.js):

```bash
ipconfig
# Lihat IPv4 Address di Wireless LAN adapter Wi-Fi
```

### File yang perlu dicek IP-nya:

- `src/api/config.js` → `const BASE_URL = 'http://IP_KAMU:8000/api'`
- `src/api/auth.js` → `const BASE_URL = 'http://IP_KAMU:8000/api'`
- `src/api/sesi.js` → `const BASE_URL = 'http://IP_KAMU:8000/api'`

---

## AKUN DEFAULT (untuk testing)

| Role     | Email                  | Password     |
| -------- | ---------------------- | ------------ |
| Admin    | admin@hexaglass.com    | Admin@123    |
| Operator | operator@hexaglass.com | Operator@123 |
| Satpam   | satpam@hexaglass.com   | Satpam@123   |

---

## DEPENDENCIES PENTING

### Backend (composer.json):

- laravel/sanctum - Auth token
- spatie/laravel-permission - Role management

### Frontend (package.json):

- expo ~54.0.33
- expo-router ~6.0.23
- expo-camera ~17.0.10
- expo-barcode-scanner
- expo-clipboard
- expo-secure-store
- axios
- react-native-qrcode-svg

---

## CATATAN PENTING

1. **Token Storage**: Menggunakan `expo-secure-store` bukan `AsyncStorage`
   karena AsyncStorage v2.2.0 tidak kompatibel dengan Expo SDK 54

2. **Supir tidak perlu login**: Supir langsung scan barcode satpam,
   endpoint supir adalah PUBLIC (tanpa auth)

3. **Barcode = QR Code**: Di sistem ini barcode dan QR Code
   merujuk ke hal yang sama (QR Code)

4. **Auto laporan**: Saat operator `selesaikan-pengisian`,
   sistem otomatis membuat record di tabel `laporan_pengisian`

5. **Prioritas antrean**: Diurutkan berdasarkan `is_prioritas` DESC,
   lalu `waktu_daftar` ASC

6. **Design system**: Warna utama HIJAU `#1a7a2e` dan ORANGE `#e8650a`
   sesuai logo PT Migas Hilir Jabar
