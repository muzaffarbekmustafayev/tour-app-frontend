import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const HotelCard = ({ hotel }) => {
  const { user } = useContext(AuthContext);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get('/auth/favorites')
      .then(res => setIsFav(res.data.some(f => f._id === hotel._id)))
      .catch(() => {});
  }, [hotel._id, user]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    try {
      if (isFav) {
        await api.delete(`/auth/favorites/${hotel._id}`);
      } else {
        await api.post(`/auth/favorites/${hotel._id}`);
      }
      setIsFav(!isFav);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden card-hover group">
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <img 
          src={hotel.image || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600'} 
          alt={hotel.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          loading="lazy"
        />
        <div className="absolute top-4 right-4">
          <button 
            onClick={toggleFavorite}
            className={`backdrop-blur-md p-2 rounded-full transition-all shadow-md active:scale-90 ${
              isFav 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 dark:bg-black/40 text-gray-400 hover:text-red-500'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </button>
        </div>
        {hotel.stars && (
          <div className="absolute bottom-4 left-4 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center">
            <span className="text-yellow-300 mr-1">★</span> {hotel.stars} Stars
          </div>
        )}
        {hotel.roomsAvailable !== undefined && hotel.roomsAvailable <= 3 && hotel.roomsAvailable > 0 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
            Only {hotel.roomsAvailable} left!
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
            {hotel.name}
          </h3>
          {hotel.rating > 0 && (
            <div className="flex items-center bg-blue-600 px-2 py-1 rounded-lg flex-shrink-0 ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="white" stroke="white" className="mr-0.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span className="text-xs font-black text-white">{hotel.rating?.toFixed?.(1) || hotel.rating}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 flex-shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span className="truncate font-medium">{hotel.city}{hotel.country ? `, ${hotel.country}` : ''}</span>
        </div>

        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {hotel.amenities.slice(0, 3).map(a => (
              <span key={a} className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{a}</span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">+{hotel.amenities.length - 3}</span>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
          <div>
            <span className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-bold tracking-wide block">per night</span>
            <div className="flex items-baseline">
              <span className="text-blue-600 dark:text-blue-400 font-black text-xl">
                {new Intl.NumberFormat('uz-UZ').format(hotel.pricePerNight || 0)}
              </span>
              <span className="text-gray-400 dark:text-gray-500 text-xs ml-1 font-bold">UZS</span>
            </div>
          </div>
          
          <Link 
            to={`/hotel/${hotel._id}`} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
          >
            Ko'rish
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;