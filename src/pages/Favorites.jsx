import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import HotelCard from '../components/HotelCard';
import api from '../services/api';
import BackButton from '../components/BackButton';
import { FiX, FiHeart } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';

const Favorites = () => {
  const [favoriteHotels, setFavoriteHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useContext(AuthContext);

  useEffect(() => {
    // Add a micro-delay to allow in-flight "addToFavorites" DB updates to settle
    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/auth/favorites');
        setFavoriteHotels(res.data.filter(Boolean));
      } catch (err) {
        setFavoriteHotels([]);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, []); // Only trigger fetch on component mount

  // We will directly render whatever the backend gives us, properly filtered of null values.
  const removeFromFavorites = async (hotelId) => {
    toggleFavorite(hotelId);
    setFavoriteHotels(prev => prev.filter(h => h._id !== hotelId));
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <BackButton className="mb-2" />
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Sevimlilar</h1>
          <p className="text-gray-500 font-medium">{favoriteHotels.length} ta saqlangan mehmonxona</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-800 h-80 rounded-3xl" />
          ))}
        </div>
      ) : favoriteHotels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteHotels.map(hotel => (
            <div key={hotel._id} className="relative group">
              <HotelCard hotel={hotel} />
              <button
                onClick={() => removeFromFavorites(hotel._id)}
                className="absolute top-4 right-4 z-10 bg-white dark:bg-slate-800 text-red-500 p-2 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                title="Remove from favorites"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center mt-20 p-10 bg-white dark:bg-[#1e293b] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="mb-4">
            <FiHeart className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sevimlilar ro'yxati bo'sh</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
            Istalgan mehmonxonani saqlab qo'yish uchun yurak ikonkasini bosing.
          </p>
          <button onClick={() => navigate('/search')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95">
            Mehmonxonalarni ko'rish
          </button>
        </div>
      )}
    </div>
  );
};

export default Favorites;
