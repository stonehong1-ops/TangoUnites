import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
// FIX: Added missing icon imports.
import { PlusIcon, ClassIcon, MilongaIcon, ShoppingBagIcon, BuildingLibraryIcon, WorkshopIcon, UsersIcon, Cog6ToothIcon } from './icons';
import { User, UserRole } from '../types';

interface AddMenuProps {
    onAddItem: (itemType: 'class' | 'milonga' | 'club' | 'service' | 'workshop' | 'admin' | 'group') => void;
    currentUser: User | null;
}

const AddMenu: React.FC<AddMenuProps> = ({ onAddItem, currentUser }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const isAdmin = currentUser?.roles.includes(UserRole.Admin);

    const handleItemClick = (itemType: 'class' | 'milonga' | 'club' | 'service' | 'workshop' | 'admin' | 'group') => {
        onAddItem(itemType);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const MenuItem: React.FC<{ onClick: () => void, icon: React.ReactNode, label: string }> = ({ onClick, icon, label }) => (
        <li>
            <button onClick={onClick} className="flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-500 hover:text-white transition-colors">
                {icon}
                <span className="ml-3">{label}</span>
            </button>
        </li>
    );

    const Separator: React.FC = () => <hr className="my-1 border-gray-200" />;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-full bg-blue-600 text-white rounded-lg shadow-md transition-all hover:bg-blue-700 py-3 text-base font-bold"
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label={t('addEvent')}
            >
                <PlusIcon className="w-5 h-5 mr-2" />
                <span>{t('addEvent')}</span>
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 w-full bg-white rounded-lg shadow-lg z-50 overflow-hidden border border-gray-200 animate-fade-in-down">
                    <ul className="py-1">
                        <MenuItem onClick={() => handleItemClick('milonga')} icon={<MilongaIcon className="w-5 h-5" />} label={t('addMilonga')} />
                        <MenuItem onClick={() => handleItemClick('class')} icon={<ClassIcon className="w-5 h-5" />} label={t('addClass')} />
                        <MenuItem onClick={() => handleItemClick('workshop')} icon={<WorkshopIcon className="w-5 h-5" />} label={t('addWorkshop')} />
                        
                        <Separator />

                        <MenuItem onClick={() => handleItemClick('group')} icon={<UsersIcon className="w-5 h-5" />} label={t('newGroup')} />
                        <MenuItem onClick={() => handleItemClick('club')} icon={<BuildingLibraryIcon className="w-5 h-5" />} label={t('addVenue')} />
                        <MenuItem onClick={() => handleItemClick('service')} icon={<ShoppingBagIcon className="w-5 h-5" />} label={t('addService')} />
                        
                        {isAdmin && (
                            <>
                                <Separator />
                                <MenuItem onClick={() => handleItemClick('admin')} icon={<Cog6ToothIcon className="w-5 h-5" />} label={t('admin')} />
                            </>
                        )}
                    </ul>
                </div>
            )}
            <style>{`
                @keyframes fade-in-down {
                    0% {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default AddMenu;