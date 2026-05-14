<div align="center">

# 🎨 NavaiTour — Frontend

**Navoiy viloyatidagi mehmonxonalarni qidiring va bron qiling**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Leaflet](https://img.shields.io/badge/Leaflet-Xarita-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

[⚙️ Backend](https://github.com/muzaffarbekmustafayev/tour-app-backend) · [📋 Issues](https://github.com/muzaffarbekmustafayev/tour-app-frontend/issues)

</div>

---

## 📑 Mundarija

- [Xususiyatlar](#-xususiyatlar)
- [Texnologiyalar](#-texnologiyalar)
- [Tezkor boshlash](#-tezkor-boshlash)
- [Muhit o'zgaruvchilari](#-muhit-ozgaruvchilari)
- [Loyiha tuzilmasi](#-loyiha-tuzilmasi)
- [Sahifalar](#-sahifalar)
- [Backend bilan ulanish](#-backend-bilan-ulanish)
- [Hissa qo'shish](#-hissa-qoshish)

---

## ✨ Xususiyatlar

| Xususiyat | Tavsif |
|-----------|--------|
| 🔍 **Kuchli qidiruv** | Shahar, narx, yulduz va kategoriya bo'yicha filtr |
| 🗺️ **Interaktiv xarita** | Leaflet asosida barcha mehmonxonalarni xaritada ko'rish |
| ♿ **Inklyuziv filtrlar** | Nogironlar aravachasi, eshitish va ko'rish imkoniyatlari |
| 🤖 **AI tavsiyalar** | Foydalanuvchi talabiga ko'ra aqlli tavsiyalar |
| 🌙 **Dark / Light rejim** | Qurilma sozlamasiga ko'ra avtomatik almashtirish |
| 📱 **Mobil-first dizayn** | iOS safe area, touch-optimized, PWA-ready |
| ❤️ **Sevimlilar** | Mehmonxonalarni saqlash va boshqarish |
| 📊 **Admin dashboard** | Statistika, foydalanuvchilar va mehmonxona boshqaruvi |
| 🏨 **Owner dashboard** | Mehmonxona egalari uchun CRUD panel |

---

## 🛠 Texnologiyalar

| Kutubxona | Versiya | Maqsad |
|-----------|---------|--------|
| React | 19 | UI framework |
| Vite | 8 | Build tool & dev server |
| React Router | 7 | Client-side routing |
| Axios | 1.x | HTTP klient (interceptorlar bilan) |
| Leaflet + React-Leaflet | 1.x / 5.x | Interaktiv xarita |
| Recharts | 3.x | Admin statistika grafiklari |
| Swiper | 12.x | Rasm karuseli |
| React Icons | 5.x | Ikonkalar kutubxonasi |

---

## 🚀 Tezkor boshlash

### Talablar

- **Node.js** 18+
- **npm** 9+
- Backend server ishga tushgan bo'lishi kerak ([Backend README](https://github.com/muzaffarbekmustafayev/tour-app-backend))

### O'rnatish

```bash
git clone https://github.com/muzaffarbekmustafayev/tour-app-frontend.git
cd tour-app-frontend
npm install

cp .env.example .env
# .env faylini tahrirlang
```

### Ishga tushirish

```bash
npm run dev       # Development (hot reload)
npm run build     # Production build
npm run preview   # Build'ni ko'rish
npm run lint      # ESLint tekshiruvi
```

> Frontend: `http://localhost:5173`

---

## 🔧 Muhit o'zgaruvchilari

| O'zgaruvchi | Tavsif | Misol |
|-------------|--------|-------|
| `VITE_APP_NAME` | Ilova nomi (hamma joyda ko'rinadi) | `NavaiTour` |
| `VITE_APP_DESCRIPTION` | SEO tavsifi | `Mehmonxona qidirish...` |
| `VITE_API_URL` | Backend API manzili | `http://localhost:5000/api` |
| `VITE_MAP_TILE_URL` | Maxsus xarita tile serveri (ixtiyoriy) | `https://{s}.tile...` |
| `NODE_ENV` | Muhit rejimi | `development` |

> ⚠️ `.env` faylini **hech qachon** GitHub'ga yuklamang!

### 📛 Loyiha nomini o'zgartirish

Faqat bitta qatorni tahrirlang:
```env
VITE_APP_NAME=SizningNomingiz
```
Browser sarlavhasi, sidebar, loading xabarlari — hammasi **avtomatik** yangilanadi.

---

## 📁 Loyiha tuzilmasi

```
tour-app-frontend/
├── public/                    # Statik fayllar
├── src/
│   ├── config/
│   │   └── app.js             # ⭐ Markaziy konfiguratsiya
│   ├── services/
│   │   └── api.js             # Axios klient + interceptorlar
│   ├── context/
│   │   └── AuthContext.jsx    # Global holat: user, dark mode
│   ├── components/            # Qayta ishlatiladigan UI
│   │   ├── MapView.jsx        #   Interaktiv xarita
│   │   ├── HotelCard.jsx      #   Mehmonxona kartochkasi
│   │   ├── FullHotelForm.jsx  #   Mehmonxona formasi
│   │   ├── BottomNav.jsx      #   Mobil navigatsiya
│   │   ├── AIRecommendations  #   AI tavsiyalar
│   │   ├── AccessibilityBanner#   Inklyuziv banner
│   │   ├── ThemeToggle.jsx    #   Dark/Light almashtirish
│   │   ├── Loader.jsx         #   Yuklanish animatsiyasi
│   │   └── ProtectedRoute.jsx #   Himoyalangan marshrutlar
│   ├── pages/                 # Sahifalar
│   │   ├── Home.jsx           #   Bosh sahifa
│   │   ├── SearchPage.jsx     #   Qidiruv + filtrlar
│   │   ├── HotelDetail.jsx    #   Mehmonxona batafsil
│   │   ├── HotelsMap.jsx      #   Xarita sahifasi
│   │   ├── Login.jsx          #   Kirish
│   │   ├── Register.jsx       #   Ro'yxatdan o'tish
│   │   ├── Profile.jsx        #   Profil
│   │   ├── Favorites.jsx      #   Sevimlilar
│   │   ├── AdminDashboard.jsx #   Admin panel
│   │   └── OwnerDashboard.jsx #   Mehmonxona egasi panel
│   ├── App.jsx                # Router tuzilmasi
│   ├── App.css                # App uslublari
│   ├── index.css              # Global CSS + o'zgaruvchilar
│   └── main.jsx               # React mount nuqtasi
├── index.html                 # SPA kirish nuqtasi
├── vite.config.js             # Vite konfiguratsiyasi
├── eslint.config.js           # ESLint qoidalari
├── .env.example               # Muhit namunasi
└── package.json
```

---

## 📄 Sahifalar

| Sahifa | Marshrut | Tavsif |
|--------|----------|--------|
| Bosh sahifa | `/` | Hero, mashhur mehmonxonalar |
| Qidiruv | `/search` | Filtrli qidiruv |
| Mehmonxona | `/hotels/:id` | Batafsil ma'lumot + sharhlar |
| Xarita | `/map` | Interaktiv Leaflet xarita |
| Kirish | `/login` | JWT autentifikatsiya |
| Ro'yxatdan o'tish | `/register` | Yangi hisob yaratish |
| Profil | `/profile` | Profil tahrirlash |
| Sevimlilar | `/favorites` | Saqlangan mehmonxonalar |
| Admin panel | `/admin` | 🔒 Statistika va boshqaruv |
| Owner panel | `/owner` | 🔒 Mehmonxona CRUD |

---

## 🔗 Backend bilan ulanish

### Development

```
Browser :5173  →  Vite Proxy  →  Backend :5000
       /api/*       →        /api/*
```

Vite proxy orqali CORS muammosi yo'q.

### Production

```env
VITE_API_URL=https://sizning-domen.com/api
```

### API klient xususiyatlari (`src/services/api.js`)

| Holat | Harakat |
|-------|---------|
| Har qanday so'rov | `Authorization: Bearer <token>` qo'shiladi |
| 401 javob | Token o'chiriladi → `/login` ga yo'naltiriladi |
| 403 javob | "Ruxsatingiz yo'q" xabari |
| 404 javob | "Topilmadi" xabari |
| 500+ javob | "Server xatosi" xabari |
| Tarmoq xatosi | "Ulanib bo'lmadi" xabari |

---

## 🤝 Hissa qo'shish

```bash
git checkout -b feature/yangi-xususiyat
git commit -m "feat: yangi komponent"
git push origin feature/yangi-xususiyat
# Pull Request oching
```

**Commit formati:** `feat:` | `fix:` | `docs:` | `refactor:` | `style:` | `chore:`

---

## 📄 Litsenziya

[MIT](LICENSE) © 2025 NavaiTour
