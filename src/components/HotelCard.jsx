import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiHeart, FiStar, FiMapPin } from 'react-icons/fi';

const HotelCard = ({ hotel }) => {
  const { user, favorites, toggleFavorite } = useContext(AuthContext);
  const isFav = favorites.includes(hotel._id);

  const handleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(hotel._id);
  };

  return (
    <div className="glass-panel overflow-hidden group hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 flex flex-col h-full border-t border-white/50 dark:border-white/5 relative">
      {/* Image Section */}
      <div className="relative h-60 overflow-hidden">
        <div className="absolute inset-0 bg-gray-200 dark:bg-slate-800 animate-pulse" />
        <img
          src={hotel.image || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800'}
          alt={hotel.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 relative z-10"
          loading="lazy"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent opacity-90 z-10 group-hover:opacity-100 transition-opacity" />

        {/* Top Badges & Actions */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
          <div className="flex flex-col gap-2">
            {hotel.stars && (
              <div className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center border border-white/20 max-w-fit">
                <FiStar className="text-yellow-400 fill-current mr-1 w-3 h-3" /> {hotel.stars} Yulduzli
              </div>
            )}
            {hotel.roomsAvailable !== undefined && hotel.roomsAvailable <= 3 && hotel.roomsAvailable > 0 && (
              <div className="bg-red-500/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-xl animate-pulse flex items-center border border-red-400/50 max-w-fit">
                Shoshiling: {hotel.roomsAvailable} ta qoldi
              </div>
            )}
          </div>
          
          {user && (
            <button
              onClick={handleFav}
              className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-90 shadow-lg ${
                isFav 
                  ? 'bg-red-500 border-red-400 text-white' 
                  : 'bg-white/20 border-white/30 text-white hover:bg-white/40'
              }`}
            >
              <FiHeart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Bottom Image Info (Rating) */}
        <div className="absolute bottom-4 left-4 z-20">
          {hotel.rating > 0 && (
            <div className="flex items-center bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <div className="bg-yellow-400 rounded p-1 flex items-center justify-center mr-2">
                <FiStar className="w-3 h-3 text-yellow-900 fill-current" />
              </div>
              <span className="text-sm font-black text-white">{hotel.rating?.toFixed?.(1) || hotel.rating}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <h3 className="font-extrabold text-gray-900 dark:text-white text-xl line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {hotel.name}
          </h3>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
            <FiMapPin className="mr-1.5 w-4 h-4 flex-shrink-0" />
            <span className="truncate font-medium">{hotel.city}{hotel.country ? `, ${hotel.country}` : ''}</span>
          </div>
        </div>

        {hotel.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {hotel.amenities.slice(0, 3).map(a => (
              <span key={a} className="text-[10px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                {a}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                +{hotel.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-end justify-between">
          <div>
            <span className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-bold tracking-widest block mb-0.5">Bir kecha uchun</span>
            <div className="flex items-baseline">
              <span className="text-blue-600 dark:text-blue-400 font-black text-2xl">
                {new Intl.NumberFormat('uz-UZ').format(hotel.pricePerNight || hotel.basePricePerNight || 0)}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs ml-1 font-bold">UZS</span>
            </div>
          </div>
          <Link
            to={`/hotel/${hotel._id}`}
            className="bg-gray-900 hover:bg-blue-600 dark:bg-white dark:hover:bg-blue-500 text-white dark:text-gray-900 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-md hover:shadow-xl active:scale-95"
          >
            Ko'rish
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
