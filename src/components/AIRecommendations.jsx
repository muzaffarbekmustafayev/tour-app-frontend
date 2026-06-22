import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuLandmark } from 'react-icons/lu';
import api from '../services/api';

const SkeletonCard = () => (
  <div className="animate-pulse bg-white/10 rounded-2xl p-4 border border-white/20">
    <div className="flex justify-between items-start mb-2">
      <div className="h-4 w-16 bg-white/20 rounded-full" />
      <div className="h-4 w-10 bg-white/20 rounded-full" />
    </div>
    <div className="w-full h-20 bg-white/15 rounded-xl mb-2" />
    <div className="h-4 w-3/4 bg-white/20 rounded-full mb-1" />
    <div className="h-3 w-1/2 bg-white/15 rounded-full" />
  </div>
);

const AIRecommendations = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/hotels?minRating=0&limit=3&sortBy=rating&order=desc')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.data || res.data.hotels || []);
        setHotels(data.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && hotels.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-bold">Tavsiya etilgan mehmonxonalar</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            [1, 2, 3].map(i => <SkeletonCard key={i} />)
          ) : hotels.map((hotel, i) => (
            <button
              key={hotel._id}
              onClick={() => navigate(`/hotel/${hotel._id}`)}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all text-left active:scale-95"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold bg-green-400 text-green-900 px-2 py-0.5 rounded-full">
                  {i === 0 ? 'Top' : i === 1 ? '2-o\'rin' : '3-o\'rin'}
                </span>
                <span className="text-xs font-bold text-yellow-300">★ {hotel.rating?.toFixed(1) || '—'}</span>
              </div>
              {hotel.images?.[0] && (
                <img src={hotel.images[0]} alt={hotel.name} className="w-full h-20 object-cover rounded-xl mb-2 opacity-90" />
              )}
              <h3 className="font-bold text-sm mb-1 line-clamp-1">{hotel.name}</h3>
              <p className="text-xs text-white/70 flex items-center gap-1 truncate">
                <span className="truncate">{hotel.city}</span>
                {hotel.nearbyPlaces?.[0] && (
                  <span className="flex items-center gap-1 truncate">· <LuLandmark className="w-3 h-3 shrink-0" /> {hotel.nearbyPlaces[0]}</span>
                )}
              </p>
            </button>
          ))}
        </div>
      </div>
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl" />
    </div>
  );
};

export default AIRecommendations;
