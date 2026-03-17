# NavaiTour — Frontend

GitHub: https://github.com/muzaffarbekmustafayev/tour-app-fronten.git

React + Vite asosidagi foydalanuvchi interfeysi.

## Texnologiyalar

- **React 18** — UI framework
- **Vite** — build tool
- **React Router** — navigatsiya
- **Axios** — HTTP so'rovlar

## O'rnatish

```bash
cd frontend
npm install
```

## Ishga tushirish

```bash
# Development
npm run dev

# Production build
npm run build

# Build preview
npm run preview
```

## Loyiha strukturasi

```
src/
├── components/    # Qayta ishlatiladigan komponentlar
├── pages/         # Sahifalar
├── assets/        # Rasmlar va statik fayllar
└── main.jsx       # Kirish nuqtasi
```

## Backend bilan ulanish

`vite.config.js` da proxy sozlangan — frontend `http://localhost:5000` ga so'rov yuboradi.
