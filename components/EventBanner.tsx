import React, { useState, useEffect } from 'react';
import { BannerItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface EventBannerProps {
  items: BannerItem[];
}

const EventBanner: React.FC<EventBannerProps> = ({ items }) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-lg border border-gray-200">
      {items.map((item, index) => {
        const handleBannerClick = () => {
          if (item.detailsUrl) {
            window.open(item.detailsUrl, '_blank', 'noopener,noreferrer');
          }
        };

        return (
          <div
            key={item.id}
            className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${item.detailsUrl ? 'cursor-pointer' : ''}`}
            style={{
              backgroundImage: `url(${item.imageUrl})`,
              opacity: index === currentIndex ? 1 : 0,
              zIndex: index === currentIndex ? 10 : 0,
            }}
            onClick={handleBannerClick}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-all" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white z-20 w-full">
              <p className="text-xl md:text-2xl font-bold text-blue-300 drop-shadow-lg mb-2">{item.duration}</p>
              <h2 className="text-2xl md:text-3xl font-bold drop-shadow-md leading-tight">{item.title}</h2>
              <p className="text-sm md:text-base text-gray-300 mt-2 drop-shadow-sm">{item.organizerName}</p>
              <div className="flex items-center gap-3 mt-4">
                  {item.detailsUrl && (
                      <a
                          href={item.detailsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white/90 hover:bg-white text-gray-900 font-bold py-2 px-5 rounded-full transition-colors text-sm shadow-md"
                      >
                          {t('details')}
                      </a>
                  )}
                  {item.signUpUrl && (
                      <a
                          href={item.signUpUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-full transition-colors text-sm shadow-md"
                      >
                          {t('signUp')}
                      </a>
                  )}
              </div>
            </div>
          </div>
        );
      })}
       
      {items.length > 1 && (
        <div className="absolute bottom-4 right-4 z-20 flex space-x-2">
            {items.map((_, index) => (
            <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentIndex === index ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={t('go_to_slide').replace('{number}', (index + 1).toString())}
            />
            ))}
        </div>
      )}
    </div>
  );
};

export default EventBanner;