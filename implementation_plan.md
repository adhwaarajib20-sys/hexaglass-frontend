# Rencana Perbaikan Force Close — Revisi

## Arsitektur Aplikasi

| Platform | Role | Penggunaan |
|---|---|---|
| **Mobile (APK)** | Satpam | Generate & tampilkan QR barcode, validasi supir |
| **Mobile (APK)** | Supir | Scan barcode, daftar antrean, buat laporan |
| **Web** | Admin | Dashboard, kelola user, verifikasi laporan |
| **Web** | Operator | Kelola antrean, input pengisian gas |

> [!IMPORTANT]
> Fitur barcode scanning **tidak akan dihapus**. Fitur ini tetap berjalan melalui `expo-camera` (`CameraView`) yang sudah dipakai di [ScanScreen.js](file:///c:/laragon/www/coba/hexaglass-frontend/src/screens/supir/ScanScreen.js#L3). Yang diperbaiki hanya konfigurasi plugin-nya.

---

## Penyebab Force Close

### 🔴 1. File Route Hilang (PENYEBAB UTAMA)

Layout tab mendefinisikan tab untuk file yang **tidak ada**. Expo Router memproses semua file di `app/` saat startup — jika file hilang, aplikasi langsung crash.

| Layout | Tab Name | File yang Dibutuhkan | Status |
|---|---|---|---|
| [admin/_layout.tsx](file:///c:/laragon/www/coba/hexaglass-frontend/app/admin/_layout.tsx#L52) | `laporan-pengisian` | `app/admin/laporan-pengisian.tsx` | ❌ TIDAK ADA |
| [operator/_layout.tsx](file:///c:/laragon/www/coba/hexaglass-frontend/app/operator/_layout.tsx#L36) | `laporan` | `app/operator/laporan.tsx` | ❌ TIDAK ADA |
| [supir/_layout.tsx](file:///c:/laragon/www/coba/hexaglass-frontend/app/supir/_layout.tsx#L40) | `laporan` | `app/supir/laporan.tsx` | ❌ TIDAK ADA |

### 🔴 2. `babel.config.js` Tidak Ada

File [parallax-scroll-view.tsx](file:///c:/laragon/www/coba/hexaglass-frontend/components/parallax-scroll-view.tsx#L3-L8) menggunakan `react-native-reanimated`. Tanpa `babel.config.js` yang menyertakan plugin reanimated, kode animasi tidak terkompilasi dengan benar di native build → crash.

### 🔴 3. Plugin `expo-barcode-scanner` Menunjuk Package yang Tidak Terinstal

Saat ini di `app.json` ada plugin `"expo-barcode-scanner"`, **tetapi** package-nya sudah di-uninstall dari `package.json` pada sesi sebelumnya. Ini menyebabkan error saat native build karena plugin tidak bisa menemukan modulnya.

**Solusi**: Ganti plugin `"expo-barcode-scanner"` dengan plugin `"expo-camera"`. Fitur scan barcode **tetap berjalan sama persis** karena kode di `ScanScreen.js` sudah menggunakan `CameraView` dari `expo-camera`. Plugin `expo-camera` memastikan permission kamera terkonfigurasi dengan benar di native build APK.

### 🟡 4. Field `app.json` Tidak Valid

`targetSdkVersion` dan `compileSdkVersion` di dalam blok `android` tidak dikenali oleh skema Expo. Ini menyebabkan warning validasi saat build. Expo secara otomatis menggunakan SDK target yang sesuai.

---

## Rencana Perbaikan

### Langkah 1: Buat 3 File Route yang Hilang

#### [NEW] `app/admin/laporan-pengisian.tsx`
Placeholder screen untuk laporan pengisian (admin — hanya diakses via web).

#### [NEW] `app/operator/laporan.tsx`
Placeholder screen untuk laporan (operator — hanya diakses via web).

#### [NEW] `app/supir/laporan.tsx`
Route yang mengimpor `FormLaporanScreen` sebagai halaman laporan supir (diakses via mobile).

---

### Langkah 2: Buat `babel.config.js`

#### [NEW] `babel.config.js`
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

---

### Langkah 3: Perbaiki Plugin di `app.json`

#### [MODIFY] [app.json](file:///c:/laragon/www/coba/hexaglass-frontend/app.json)
- Ganti `"expo-barcode-scanner"` dengan `"expo-camera"` di daftar plugins.
- Hapus `targetSdkVersion` dan `compileSdkVersion`.

Sebelum:
```json
"plugins": [
  "expo-router",
  ["expo-splash-screen", { ... }],
  "expo-barcode-scanner",    ← package tidak terinstal
  "expo-secure-store"
]
```

Sesudah:
```json
"plugins": [
  "expo-router",
  ["expo-splash-screen", { ... }],
  "expo-camera",             ← menggantikan barcode scanner, fitur tetap sama
  "expo-secure-store"
]
```

> [!NOTE]
> **Fitur barcode tetap utuh.** `expo-camera` di SDK 54 sudah memiliki kemampuan scan barcode bawaan melalui `CameraView` yang sudah dipakai di `ScanScreen.js`. Plugin `expo-camera` hanya memastikan permission kamera di-setup dengan benar di native build.

---

### Langkah 4: Hapus File Template Expo Default

#### [DELETE] `app/(tabs)/explore.tsx`
File bawaan template Expo yang tidak digunakan. File ini mengimpor komponen yang menggunakan `react-native-reanimated` dan bisa menyebabkan error tambahan.

---

## Rencana Verifikasi

1. Jalankan `npx expo-doctor` — pastikan semua check passed.
2. Jalankan `npx expo start --clear` — pastikan bundler tidak error.
3. Build APK dengan `npx eas-cli build --platform android --profile preview`.
4. Install APK di HP dan pastikan tidak force close.
