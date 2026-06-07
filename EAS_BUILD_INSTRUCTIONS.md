# 📱 EAS BUILD - HEXAGLASS FRONTEND

## ✅ SETUP SELESAI

### Configuration Changed:

- ✅ `.env`: API URL → `https://web-production-7b6ff.up.railway.app/api`
- ✅ `app.json`: slug → `hexaglass` (valid format)
- ✅ `eas.json`: EAS configuration created
- ✅ `eas-cli`: Installed locally

---

## 🚀 ANDROID BUILD RUNNING

**Build ID**: 9725e07b-714d-489d-80c6-5f41ed99eb12

**Status**: ⏳ In Progress (5-15 minutes)

**Watch Live**:
https://expo.dev/accounts/adhwaa20/projects/hexaglass/builds/9725e07b-714d-489d-80c6-5f41ed99eb12

**Package ID**: `com.adhwaa20.hexaglass`

**Build Type**: APK (preview)

---

## 📦 SETELAH ANDROID BUILD SELESAI

### Option 1: Download APK

```
1. Go to build URL above
2. Click "Download" untuk APK
3. Transfer ke Android phone
4. Install dan test
```

### Option 2: Build iOS (jika ada Mac)

```bash
npx eas-cli build --platform ios --profile preview
```

---

## 🧪 TESTING STEPS

### Android:

1. Download APK dari build link
2. Install di Android phone: `adb install app.apk`
3. Buka app
4. Harus connect ke: `https://web-production-7b6ff.up.railway.app/api`

### iOS:

1. Build dengan EAS
2. Download .ipa
3. Install dengan TestFlight atau Xcode

---

## 📋 API ENDPOINT TESTED

App akan connect ke:

```
https://web-production-7b6ff.up.railway.app/api
```

Endpoints yang tersedia:

- ✅ `POST /api/auth/login`
- ✅ `POST /api/auth/register`
- ✅ `GET /api/supir/daftar-perusahaan`
- ✅ `GET /api/health` (debug)

---

## ⏳ BUILD STATUS

**Current**: Android APK building...

Waiting for completion ⏳

Check status at: https://expo.dev/accounts/adhwaa20/projects/hexaglass/builds/9725e07b-714d-489d-80c6-5f41ed99eb12
