# NavaiTour Frontend 🇺🇿

Ushbu qism NavaiTour loyihasining mijozlar (sayyohlar) hamda mehmonxona egalari, adminlar uchun mo'ljallangan User Interface (UI) qismidir. React.js va Vite texnologiyalari yordamida yozilgan.

## Asosiy texnologiyalar
- **[React](https://reactjs.org/)** (v18.x) - Asosiy freymvork
- **[Vite](https://vitejs.dev/)** - Loyihani yig'ish (build) va development serveri uchun
- **[Tailwind CSS](https://tailwindcss.com/)** - UI dizayn (Utility-first CSS) va interaktiv (Glassmorphism) effektlar uchun
- **[MapLibre GL JS](https://maplibre.org/)** - 3D va vektor xaritalarni ko'rsatish uchun
- **Axios** - Backend API lar bilan ulanish uchun
- **React Router DOM** - Sahifalararo navigatsiya uchun
- **Zustand / Context API** - Holat (state) ni boshqarish uchun

## Ishga tushirish (O'rnatish)

Ushbu repozitoriyni klonlagach, loyihani mahalliy (local) muhitda ishga tushirish uchun quyidagilarni bajaring:

### 1. Paketlarni o'rnatish
Terminal (CLI) orqali ushbu papkaga (frontend) kiring va barcha kutubxonalarni o'rnating:
```bash
npm install
```

### 2. .env faylini yaratish
Loyiha ichida (papkada) `.env` nomli fayl yarating va unga backend manzilini kiriting:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Dasturni yurgizish
Dasturni development muhitida ishga tushirish uchun:
```bash
npm run dev
```
Dastur `http://localhost:5173` yoki terminalda ko'rsatilgan boshqa manzil orqali brauzerda ochiladi.

## Qisqacha tuzilishi
- `/src/components` — Ko'p marta ishlatiladigan komponentlar (masalan: tugmalar, navbar, markerlar).
- `/src/pages` — Asosiy sahifalar (Bosh sahifa, Profil, Xarita, Admin Dashboard va h.k).
- `/src/services` — Backend bilan aloqa qiluvchi HTTP (axios) funksiyalar.
- `/src/context` — Foydalanuvchi ma'lumotlarini (AuthContext) va Dark Mode'ni boshqarish state'lari.
- `/src/utils` — Xarita yordamchilari va formatlovchi (yordamchi) funksiyalar.

## Litsenziya
MIT
