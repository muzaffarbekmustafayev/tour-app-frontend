import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HotelCard from '../components/HotelCard';
import api from '../services/api';
import BackButton from '../components/BackButton';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/auth/favorites')
      .then(res => setFavorites(res.data))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, []);

  const removeFromFavorites = async (hotelId) => {
    try {
      await api.delete(`/auth/favorites/${hotelId}`);
      setFavorites(prev => prev.filter(h => h._id !== hotelId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <BackButton className="mb-2" />
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Sevimlilar</h1>
          <p className="text-gray-500 font-medium">{favorites.length} saved {favorites.length === 1 ? 'place' : 'places'}</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-800 h-80 rounded-3xl" />
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(hotel => (
            <div key={hotel._id} className="relative group">
              <HotelCard hotel={hotel} />
              <button
                onClick={() => removeFromFavorites(hotel._id)}
                className="absolute top-4 right-4 z-10 bg-white dark:bg-slate-800 text-red-500 p-2 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                title="Remove from favorites"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center mt-20 p-10 bg-white dark:bg-[#1e293b] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-6xl mb-4">💔</p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No favorites yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
            Tap the ❤️ heart icon on any hotel to save it to your favorites.
          </p>
          <button onClick={() => navigate('/search')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95">
            Explore Hotels
          </button>
        </div>
      )}
    </div>
  );
};

export default Favorites;
