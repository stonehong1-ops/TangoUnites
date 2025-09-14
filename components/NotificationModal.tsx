import React from 'react';
import { Notification as AppNotification, User, NotificationType, Group, Milonga } from '../types';
import { HeartIcon, ChatBubbleOvalLeftIcon, UsersIcon, XMarkIcon } from './icons';
import { MALE_AVATAR_URL, FEMALE_AVATAR_URL } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: AppNotification[];
    usersMap: Map<string, User>;
    groupsMap: Map<string, Group>;
    milongasMap: Map<string, Milonga>;
    currentUser: User | null;
    onNotificationClick: (notification: AppNotification) => void;
    onGroupRequestAction: (notification: AppNotification, status: 'approved' | 'declined') => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, notifications, usersMap, groupsMap, milongasMap, currentUser, onNotificationClick, onGroupRequestAction }) => {
    const { t } = useLanguage();

    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case NotificationType.Like:
                return <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center"><HeartIcon className="w-5 h-5" /></div>;
            case NotificationType.Comment:
                return <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center"><ChatBubbleOvalLeftIcon className="w-5 h-5" /></div>;
            case NotificationType.GroupRequest:
            case NotificationType.GroupRequestApproved:
            case NotificationType.MilongaInquiry:
                return <div className="w-8 h-8 rounded-full bg-green-100 text-green-500 flex items-center justify-center"><UsersIcon className="w-5 h-5" /></div>;
            default:
                return null;
        }
    };

    const getNotificationText = (notification: AppNotification) => {
        const fromUser = usersMap.get(notification.fromUserId);
        if (!fromUser) return '';

        switch (notification.type) {
            case NotificationType.Like:
                return t('likeNotification').replace('{user}', fromUser.nickname);
            case NotificationType.Comment:
                return t('commentNotification').replace('{user}', fromUser.nickname);
            case NotificationType.GroupRequest:
                const group = notification.groupId ? groupsMap.get(notification.groupId) : null;
                return t('groupRequestNotification').replace('{user}', fromUser.nickname).replace('{group}', group?.name || '');
             case NotificationType.GroupRequestApproved:
                const approvedGroup = notification.groupId ? groupsMap.get(notification.groupId) : null;
                return t('groupRequestApprovedNotification').replace('{user}', fromUser.nickname).replace('{group}', approvedGroup?.name || '');
            case NotificationType.MilongaInquiry:
                const milonga = notification.milongaId ? milongasMap.get(notification.milongaId) : null;
                return t('milongaInquiryNotification').replace('{user}', fromUser.nickname).replace('{milonga}', milonga?.title || '');
            default:
                return '';
        }
    };
    
    const formatText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black bg-opacity-25 z-50 animate-fade-in" onClick={onClose}></div>}
            <div className={`absolute top-14 right-4 bg-white w-full max-w-sm rounded-lg shadow-2xl border border-gray-200 z-[60] flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`} style={{ transformOrigin: 'top right' }}>
                <header className="p-3 border-b flex items-center justify-between flex-shrink-0">
                    <h2 className="font-bold text-lg">{t('notifications')}</h2>
                    <button onClick={onClose} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="overflow-y-auto flex-grow max-h-[70vh]">
                    {notifications.length === 0 ? (
                        <p className="text-center text-gray-500 p-8">{t('noNewNotifications')}</p>
                    ) : (
                        notifications
                        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map(notification => {
                            const fromUser = usersMap.get(notification.fromUserId);
                            if (!fromUser) return null;

                            const group = notification.groupId ? groupsMap.get(notification.groupId) : null;
                            const isGroupAdmin = currentUser && group && group.creatorId === currentUser.id;

                            return (
                                <button key={notification.id} onClick={() => onNotificationClick(notification)} className={`w-full flex flex-col items-start gap-3 p-4 text-left transition-colors border-b border-gray-100 ${!notification.read ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}>
                                    <div className="flex items-start gap-3 w-full">
                                        <div className="flex-shrink-0 relative">
                                            <img src={fromUser.photoUrl || (fromUser.gender === 'Tanguero' ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)} alt={fromUser.nickname} className="w-10 h-10 rounded-full object-cover" />
                                            <div className="absolute -bottom-1 -right-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-sm text-gray-800">
                                                {formatText(getNotificationText(notification))}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notification.read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>}
                                    </div>

                                    {notification.type === NotificationType.GroupRequest && isGroupAdmin && !notification.requestStatus && (
                                        <div className="w-full pl-14 flex items-center gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); onGroupRequestAction(notification, 'approved'); }} className="bg-blue-500 text-white text-xs font-bold py-1.5 px-3 rounded-full hover:bg-blue-600">
                                                {t('approve')}
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); onGroupRequestAction(notification, 'declined'); }} className="bg-gray-200 text-gray-700 text-xs font-bold py-1.5 px-3 rounded-full hover:bg-gray-300">
                                                {t('decline')}
                                            </button>
                                        </div>
                                    )}
                                    {notification.type === NotificationType.GroupRequest && notification.requestStatus && (
                                        <div className="w-full pl-14">
                                            <p className="text-xs font-semibold text-gray-500">
                                                {notification.requestStatus === 'approved' ? t('approved') : t('declined')}
                                            </p>
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationModal;