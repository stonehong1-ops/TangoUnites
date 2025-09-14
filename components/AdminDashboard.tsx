import React, { useState, useMemo, useEffect } from 'react';
import { User, AnyEvent, Venue, Service, Post, BannerItem, Gender, UserRole, Group, Milonga, Class, Workshop, EventType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { TrashIcon, EditIcon } from './icons';

// --- Sub-component: BannerManager ---
const BannerManager: React.FC<{
    banners: BannerItem[],
    onSaveBanner: (banner: Omit<BannerItem, 'id'> | BannerItem) => void;
    onDeleteBanner: (bannerId: string) => void;
}> = ({ banners, onSaveBanner, onDeleteBanner }) => {
    const { t } = useLanguage();
    const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('');
    const [organizerName, setOrganizerName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [detailsUrl, setDetailsUrl] = useState('');
    const [signUpUrl, setSignUpUrl] = useState('');

    const isEditMode = !!editingBanner;

    useEffect(() => {
        if (editingBanner) {
            setTitle(editingBanner.title);
            setDuration(editingBanner.duration);
            setOrganizerName(editingBanner.organizerName);
            setImageUrl(editingBanner.imageUrl);
            setDetailsUrl(editingBanner.detailsUrl || '');
            setSignUpUrl(editingBanner.signUpUrl || '');
        } else {
            resetForm();
        }
    }, [editingBanner]);

    const resetForm = () => {
        setEditingBanner(null);
        setTitle('');
        setDuration('');
        setOrganizerName('');
        setImageUrl('');
        setDetailsUrl('');
        setSignUpUrl('');
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !duration || !organizerName || !imageUrl) {
            alert(t('fillAllFields'));
            return;
        }
        const bannerData = { title, duration, organizerName, imageUrl, detailsUrl, signUpUrl };
        if (isEditMode) {
            onSaveBanner({ ...bannerData, id: editingBanner.id });
        } else {
            onSaveBanner(bannerData);
        }
        resetForm();
    };
    
    const handleDelete = (bannerId: string) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            onDeleteBanner(bannerId);
            if(editingBanner?.id === bannerId) {
                resetForm();
            }
        }
    }

    const inputClass = "w-full bg-gray-50 text-gray-900 rounded-md p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";
    
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{isEditMode ? t('editBanner') : t('addNewBanner')}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('bannerTitle')} className={inputClass} required />
                    <input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder={t('bannerDuration')} className={inputClass} required />
                    <input type="text" value={organizerName} onChange={e => setOrganizerName(e.target.value)} placeholder={t('bannerOrganizerName')} className={inputClass} required />
                    <input type="text" value={detailsUrl} onChange={e => setDetailsUrl(e.target.value)} placeholder={t('bannerDetailsUrl')} className={inputClass} />
                    <input type="text" value={signUpUrl} onChange={e => setSignUpUrl(e.target.value)} placeholder={t('bannerSignUpUrl')} className={inputClass} />
                    <div>
                        <label className={labelClass}>{t('bannerImage')}</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm" />
                        {imageUrl && <img src={imageUrl} alt="Preview" className="w-48 h-24 rounded-md object-cover border mt-2" />}
                    </div>
                    <div className="flex justify-end space-x-4 pt-2">
                        {isEditMode && <button type="button" onClick={resetForm} className="py-2 px-4 rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300">{t('cancel')}</button>}
                        <button type="submit" className="py-2 px-4 rounded-full text-white bg-blue-600 hover:bg-blue-700 font-bold">{isEditMode ? t('saveChanges') : t('addBanner')}</button>
                    </div>
                </form>
            </div>
            <div className="flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t('currentBanners')}</h3>
                <div className="overflow-y-auto space-y-2 pr-2 -mr-2 flex-grow bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {banners.map(banner => (
                        <div key={banner.id} className="bg-white p-2 rounded-lg flex items-center justify-between gap-2 border">
                            <img src={banner.imageUrl} alt={banner.title} className="w-16 h-10 rounded object-cover" />
                            <div className="flex-grow overflow-hidden px-2">
                                <p className="font-bold text-sm truncate">{banner.title}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setEditingBanner(banner)} className="p-2 rounded-full hover:bg-gray-100"><EditIcon className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(banner.id)} className="p-2 rounded-full hover:bg-gray-100 text-red-500"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface AdminTableProps<T> {
  data: T[];
  columns: { header: string; accessor: (item: T) => React.ReactNode }[];
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  searchPlaceholder: string;
  filterFn: (item: T, term: string) => boolean;
}

const AdminTable = <T extends { id: string }>({ data, columns, onEdit, onDelete, searchPlaceholder, filterFn }: AdminTableProps<T>) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const filteredData = useMemo(() => data.filter(item => filterFn(item, searchTerm.toLowerCase())), [data, searchTerm, filterFn]);

    return (
        <div>
            <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-gray-100 rounded-md py-2 px-4 border-transparent focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            {columns.map(col => <th key={col.header} scope="col" className="px-6 py-3">{col.header}</th>)}
                            <th scope="col" className="px-6 py-3">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map(item => (
                            <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                {columns.map(col => <td key={col.header} className="px-6 py-4">{col.accessor(item)}</td>)}
                                <td className="px-6 py-4 flex items-center gap-2">
                                    <button onClick={() => onEdit(item)} className="p-2 rounded-full hover:bg-gray-100"><EditIcon className="w-4 h-4 text-blue-600" /></button>
                                    <button onClick={() => onDelete(item.id)} className="p-2 rounded-full hover:bg-gray-100"><TrashIcon className="w-4 h-4 text-red-600" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


interface AdminDashboardProps {
    users: User[];
    milongas: Milonga[];
    classes: Class[];
    workshops: Workshop[];
    clubs: Venue[];
    services: Service[];
    posts: Post[];
    groups: Group[];
    banners: BannerItem[];
    onClose: () => void;
    onSaveBanner: (banner: Omit<BannerItem, 'id'> | BannerItem) => void;
    onDeleteBanner: (bannerId: string) => void;
    onEditUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    onEditEvent: (event: AnyEvent) => void;
    onDeleteEvent: (eventId: string) => void;
    onEditClub: (club: Venue) => void;
    onDeleteClub: (clubId: string) => void;
    onEditService: (service: Service) => void;
    onDeleteService: (serviceId: string) => void;
    onEditPost: (post: Post) => void;
    onDeletePost: (postId: string) => void;
    onEditGroup: (group: Group) => void;
    onDeleteGroup: (groupId: string) => void;
    usersMap: Map<string, User>;
    venuesMap: Map<string, Venue>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
    users,
    milongas,
    classes,
    workshops,
    clubs,
    services,
    posts,
    groups,
    banners,
    onClose,
    onSaveBanner,
    onDeleteBanner,
    onEditUser,
    onDeleteUser,
    onEditEvent,
    onDeleteEvent,
    onEditClub,
    onDeleteClub,
    onEditService,
    onDeleteService,
    onEditPost,
    onDeletePost,
    onEditGroup,
    onDeleteGroup,
    usersMap,
    venuesMap,
}) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('banners');

    const tabs = [
        { id: 'banners', label: t('bannerManagement') },
        { id: 'users', label: t('people') },
        { id: 'events', label: t('events') },
        { id: 'clubs', label: t('venues') },
        { id: 'services', label: t('services') },
        { id: 'posts', label: t('feed') },
        { id: 'groups', label: t('cafe') },
    ];
    
    const allEvents = useMemo(() => [...milongas, ...classes, ...workshops], [milongas, classes, workshops]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-6 w-full max-w-4xl mx-auto transform transition-all max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t('adminDashboard')}</h2>
                <div className="flex border-b border-gray-200 mb-4">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 text-sm font-semibold ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>{tab.label}</button>
                    ))}
                </div>
                <div className="overflow-y-auto flex-grow">
                    {activeTab === 'banners' && <BannerManager banners={banners} onSaveBanner={onSaveBanner} onDeleteBanner={onDeleteBanner} />}
                    {activeTab === 'users' && <AdminTable<User> data={users} onEdit={onEditUser} onDelete={onDeleteUser} searchPlaceholder={t('searchByUser')} filterFn={(item, term) => item.nickname.toLowerCase().includes(term) || item.nativeNickname.toLowerCase().includes(term)} columns={[ { header: 'ID', accessor: item => item.id }, { header: t('nickname'), accessor: item => item.nickname }, { header: t('nativeNickname'), accessor: item => item.nativeNickname }, { header: t('phoneNumber'), accessor: item => item.phoneNumber }, { header: t('roles'), accessor: item => item.roles.join(', ') }, ]} />}
                    {activeTab === 'events' && <AdminTable<AnyEvent> data={allEvents} onEdit={onEditEvent} onDelete={onDeleteEvent} searchPlaceholder={t('searchByEventTitle')} filterFn={(item, term) => item.title.toLowerCase().includes(term)} columns={[ { header: 'ID', accessor: item => item.id }, { header: t('eventTitle'), accessor: item => item.title }, { header: t('eventType'), accessor: item => item.type }, { header: t('date'), accessor: item => (item as Milonga).date || (item as Class).sessions[0]?.date || (item as Workshop).dates[0] }, ]} />}
                    {activeTab === 'clubs' && <AdminTable<Venue> data={clubs} onEdit={onEditClub} onDelete={onDeleteClub} searchPlaceholder={t('searchByVenueName')} filterFn={(item, term) => item.name.toLowerCase().includes(term)} columns={[ { header: 'ID', accessor: item => item.id }, { header: t('venueName'), accessor: item => item.name }, { header: t('region'), accessor: item => item.region }, ]} />}
                    {activeTab === 'services' && <AdminTable<Service> data={services} onEdit={onEditService} onDelete={onDeleteService} searchPlaceholder={t('adminSearchByServiceName')} filterFn={(item, term) => item.name.toLowerCase().includes(term)} columns={[ { header: 'ID', accessor: item => item.id }, { header: t('serviceName'), accessor: item => item.name }, { header: t('serviceCategory'), accessor: item => item.category }, { header: t('host'), accessor: item => usersMap.get(item.hostId)?.nickname }, ]} />}
                    {activeTab === 'posts' && <AdminTable<Post> data={posts} onEdit={onEditPost} onDelete={onDeletePost} searchPlaceholder={t('searchByPostContent')} filterFn={(item, term) => item.content.toLowerCase().includes(term)} columns={[ { header: 'ID', accessor: item => item.id }, { header: t('postContent'), accessor: item => <p className="truncate w-64">{item.content}</p> }, { header: t('author'), accessor: item => usersMap.get(item.authorId)?.nickname }, ]} />}
                    {activeTab === 'groups' && <AdminTable<Group> data={groups} onEdit={onEditGroup} onDelete={onDeleteGroup} searchPlaceholder={t('searchByGroupName')} filterFn={(item, term) => item.name.toLowerCase().includes(term)} columns={[ { header: 'ID', accessor: item => item.id }, { header: t('groupName'), accessor: item => item.name }, { header: 'Members', accessor: item => item.memberIds.length }, ]} />}
                </div>
            </div>
        </div>
    );
};
