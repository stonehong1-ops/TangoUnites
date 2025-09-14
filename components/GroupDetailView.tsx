import React from 'react';
import { User, Group } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { UsersIcon } from './icons';

interface GroupDetailViewProps {
    group: Group;
    onClose: () => void;
    currentUser: User | null;
    onJoinOrRequest: (group: Group) => void;
}

const GroupDetailView: React.FC<GroupDetailViewProps> = ({ group, onClose, currentUser, onJoinOrRequest }) => {
    const { t } = useLanguage();

    const isMember = currentUser ? group.memberIds.includes(currentUser.id) : false;

    const getButtonText = () => {
        if (group.requiresApproval) {
            return t('requestToJoin');
        }
        return t('joinGroup');
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto transform transition-all max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative">
                    <img src={group.imageUrls[0]} alt={group.name} className="w-full h-48 object-cover rounded-t-xl" />
                    <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 rounded-full p-2 text-white hover:bg-black/80 transition-colors z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-2xl font-bold text-gray-900">{group.name}</h2>
                    <div className="flex items-center gap-2 text-gray-500 mt-2">
                        <UsersIcon className="w-5 h-5"/>
                        <span>{group.memberIds.length} {t('members')}</span>
                    </div>
                    <p className="text-gray-700 my-4 flex-grow">{group.description}</p>
                    
                    {!isMember && (
                        <button 
                            onClick={() => onJoinOrRequest(group)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
                        >
                            {getButtonText()}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupDetailView;
