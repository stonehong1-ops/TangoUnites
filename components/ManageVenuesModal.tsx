import React from 'react';
import { Venue, User } from '../types';
import { TrashIcon, EditIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface ManageVenuesModalProps {
  venues: Venue[];
  users: User[];
  onClose: () => void;
  onEditVenue: (venue: Venue) => void;
  onAddNewVenue: () => void;
  onDeleteVenue: (venueId: string) => void;
}

const ManageVenuesModal: React.FC<ManageVenuesModalProps> = ({ venues, users, onClose, onEditVenue, onAddNewVenue, onDeleteVenue }) => {
  const { t } = useLanguage();
  const usersMap = React.useMemo(() => new Map(users.map(u => [u.id, u.nickname])), [users]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-gray-200 rounded-lg shadow-xl p-8 w-full max-w-2xl mx-auto transform transition-all max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">{t('manageVenues')}</h2>
            <button
                onClick={onAddNewVenue}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-transform transform hover:scale-105 text-sm"
            >
                + {t('addNewVenue')}
            </button>
        </div>
        
        <div className="overflow-y-auto space-y-3 pr-2 -mr-2 flex-grow">
          {venues.length > 0 ? venues
            .sort((a,b) => a.name.localeCompare(b.name))
            .map(venue => {
              const creatorName = usersMap.get(venue.creatorId);
              return (
                <div key={venue.id} className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{venue.name}</p>
                    <p className="text-sm text-gray-500">{venue.address}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm">
                        <span className="text-blue-600 font-semibold">[{venue.region}]</span>
                        {creatorName && <span className="text-gray-700">{t('creator')}: {creatorName}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                        onClick={() => onEditVenue(venue)} 
                        className="flex items-center gap-2 py-2 px-4 rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300 transition text-sm font-semibold"
                    >
                        <EditIcon className="w-4 h-4" />
                        <span>{t('edit')}</span>
                    </button>
                    <button
                        onClick={() => onDeleteVenue(venue.id)}
                        className="p-2 rounded-full text-red-500 hover:bg-red-500/10 transition"
                        aria-label={`Delete ${venue.name}`}
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            }) : (
            <p className="text-center text-gray-500 py-8">{t('noVenuesRegistered')}</p>
          )}
        </div>

        <div className="mt-8 text-right">
            <button onClick={onClose} className="py-2 px-6 rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300 font-bold transition">{t('close')}</button>
        </div>
      </div>
    </div>
  );
};

export default ManageVenuesModal;