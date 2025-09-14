import React, { useState, useMemo } from 'react';
import { User, Venue, Service, Gender, Group, Region, ServiceCategory } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { MALE_AVATAR_URL, FEMALE_AVATAR_URL } from '../constants';
import ServiceList from './ServiceModal';
import { SearchIcon, UsersIcon } from './icons';
import SwipeableTabView, { Tab } from './SwipeableTabView';

// PeopleView Component
const PeopleView: React.FC<{
  users: User[];
  onUserClick: (user: User) => void;
}> = ({ users, onUserClick }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nativeNickname.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);
  
  return (
    <div className="space-y-4">
        <div className="bg-white p-2 rounded-xl shadow-sm">
            <input
                type="text"
                placeholder={t('searchByNicknameOrPhone')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-100 border-transparent rounded-md focus:ring-blue-500"
            />
        </div>
        <div className="space-y-3">
            {filteredUsers.map(user => (
                <button key={user.id} onClick={() => onUserClick(user)} className="w-full flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition text-left group border">
                    <img src={user.photoUrl || (user.gender === Gender.Tanguero ? MALE_AVATAR_URL : FEMALE_AVATAR_URL)} alt={user.nickname} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-grow">
                        <p className="font-bold text-gray-900 group-hover:text-blue-600">{user.nickname}</p>
                        <p className="text-sm text-gray-500">{user.nativeNickname}</p>
                    </div>
                </button>
            ))}
        </div>
    </div>
  );
};

// VenuesView Component
const VenueOfTheWeekCard: React.FC<{ venue: Venue, onClubClick: (venue: Venue) => void }> = ({ venue, onClubClick }) => {
    const { t } = useLanguage();
    return (
        <div onClick={() => onClubClick(venue)} className="relative w-full h-48 bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 cursor-pointer group mb-6">
            <img src={venue.imageUrls[0]} alt={venue.name} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity duration-300"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-5 text-white">
                <h3 className="text-2xl font-bold drop-shadow-md leading-tight">{venue.name}</h3>
                <p className="text-sm text-gray-300 mt-1 drop-shadow-sm">{t(venue.region)}</p>
                <button className="mt-3 bg-white/90 hover:bg-white text-gray-900 font-bold py-1.5 px-4 rounded-full transition-colors text-xs shadow-md">
                    {t('viewDetails')}
                </button>
            </div>
        </div>
    );
};

const VenuesView: React.FC<{
  venues: Venue[];
  onClubClick: (venue: Venue) => void;
  onAddVenue: () => void;
}> = ({ venues, onClubClick, onAddVenue }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Region | 'all'>('all');

  const venueOfTheWeek = useMemo(() => {
    if (venues.length === 0) return null;
    const candidates = venues.filter(v => v.imageUrls.length > 0);
    if (candidates.length === 0) return venues[0];
    return candidates[Math.floor(Math.random() * candidates.length)];
  }, [venues]);

  const filteredVenues = useMemo(() => {
      return venues.filter(venue => 
        (selectedRegion === 'all' || venue.region === selectedRegion) &&
        venue.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [venues, searchTerm, selectedRegion]);

  return (
    <div className="space-y-4">
      {venueOfTheWeek && <VenueOfTheWeekCard venue={venueOfTheWeek} onClubClick={onClubClick} />}
      <div className="bg-white p-2 rounded-xl shadow-sm flex items-center gap-2">
        <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value as Region | 'all')} className="bg-gray-100 border-transparent rounded-md focus:ring-blue-500 text-sm">
          <option value="all">{t('allRegions')}</option>
          {Object.values(Region).map(r => <option key={r} value={r}>{t(r)}</option>)}
        </select>
        <div className="relative flex-grow">
            <input
              type="text"
              placeholder={t('searchByVenueName')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 border-transparent rounded-md focus:ring-blue-500 pl-10"
            />
             <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <button onClick={onAddVenue} className="flex-shrink-0 bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition text-sm">
          + {t('registerVenue')}
        </button>
      </div>
        <div className="space-y-4">
            {filteredVenues.map(venue => (
                <button key={venue.id} onClick={() => onClubClick(venue)} className="w-full bg-white rounded-xl shadow-sm text-left overflow-hidden transform transition-transform hover:-translate-y-1 flex">
                    <img src={venue.imageUrls[0]} alt={venue.name} className="w-1/3 h-full object-cover"/>
                    <div className="p-4">
                        <p className="font-bold text-gray-800">{venue.name}</p>
                        <p className="text-sm text-gray-500">{venue.address}</p>
                        <p className="text-sm font-semibold text-blue-600 mt-1">{t(venue.region)}</p>
                    </div>
                </button>
            ))}
        </div>
    </div>
  );
};

// CommunityListView Component
const HotCafeCard: React.FC<{ group: Group; onGroupClick: (group: Group) => void; }> = ({ group, onGroupClick }) => (
    <button onClick={() => onGroupClick(group)} className="relative flex-shrink-0 w-40 h-52 bg-gray-800 rounded-xl overflow-hidden shadow-lg cursor-pointer group">
        <img src={group.imageUrls[0]} alt={group.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-300"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-3 text-white">
            <h4 className="font-bold leading-tight drop-shadow-md">{group.name}</h4>
        </div>
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">HOT</div>
    </button>
);

const TopCafeItem: React.FC<{ group: Group; rank: number; onGroupClick: (group: Group) => void; }> = ({ group, rank, onGroupClick }) => {
    const { t } = useLanguage();
    return (
        <button onClick={() => onGroupClick(group)} className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition text-left">
            <span className="text-lg font-bold w-6 text-center text-gray-500">{rank}</span>
            <img src={group.imageUrls[0]} alt={group.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-grow">
                <p className="font-bold text-gray-900">{group.name}</p>
                <p className="text-xs text-gray-500">{t('membersCount').replace('{count}', group.memberIds.length.toString())}</p>
            </div>
            <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-3 py-1 rounded-full">{t('joinGroup')}</span>
        </button>
    );
};

const CommunityListView: React.FC<{
    groups: Group[];
    currentUser: User | null;
    onGroupClick: (group: Group) => void;
    onAddCommunity: () => void;
  }> = ({ groups, currentUser, onGroupClick, onAddCommunity }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');

    const { hotGroups, topGroups, discoverGroups } = useMemo(() => {
        const sortedByNewest = [...groups].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const sortedByMembers = [...groups].sort((a, b) => b.memberIds.length - a.memberIds.length);
        const hot = sortedByNewest.slice(0, 5);
        const top = sortedByMembers.slice(0, 5);

        const lowerSearch = searchTerm.toLowerCase();
        const allDiscover = (currentUser ? groups.filter(g => !g.memberIds.includes(currentUser.id)) : groups)
            .filter(g => g.name.toLowerCase().includes(lowerSearch) || g.description.toLowerCase().includes(lowerSearch));

        return { hotGroups: hot, topGroups: top, discoverGroups: allDiscover };
    }, [groups, currentUser, searchTerm]);
  
    return (
      <div className="space-y-6">
          {/* Hot Cafes */}
          <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">{t('hotCafes')}</h2>
              <div className="flex gap-4 overflow-x-auto pb-3 -mb-3 scrollbar-hide">
                  {hotGroups.map(group => <HotCafeCard key={group.id} group={group} onGroupClick={onGroupClick} />)}
              </div>
          </div>
          {/* Top 5 & Discover */}
          <div className="space-y-6">
              <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">{t('hallOfFame')}</h2>
                  <div className="bg-white p-3 rounded-xl shadow-sm border space-y-2">
                      <h3 className="font-bold text-gray-500 text-center text-sm mb-2">{t('top5ByMembers')}</h3>
                      {topGroups.map((group, index) => <TopCafeItem key={group.id} group={group} rank={index + 1} onGroupClick={onGroupClick} />)}
                  </div>
              </div>
              <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">{t('discoverMore')}</h2>
                  <div className="bg-white p-3 rounded-xl shadow-sm border">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder={t('searchCommunities')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-100 border-transparent rounded-md focus:ring-blue-500 pl-10 text-sm py-2"
                            />
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                        <button onClick={onAddCommunity} className="flex-shrink-0 bg-blue-50 text-blue-700 font-bold py-2 px-3 rounded-md hover:bg-blue-100 transition text-sm">
                            + {t('newGroup')}
                        </button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {discoverGroups.map(group => (
                            <button key={group.id} onClick={() => onGroupClick(group)} className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition text-left">
                                <img src={group.imageUrls[0]} alt={group.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                <div className="flex-grow">
                                    <p className="font-semibold text-gray-800 text-sm">{group.name}</p>
                                    <p className="text-xs text-gray-500">{group.memberIds.length} members</p>
                                </div>
                            </button>
                        ))}
                    </div>
                  </div>
              </div>
          </div>
      </div>
    );
  };


// ServicesView Component
const ServicesView: React.FC<{
    services: Service[];
    usersMap: Map<string, User>;
    currentUser: User | null;
    onServiceClick: (service: Service) => void;
    onEditService: (service: Service) => void;
    onDeleteService: (serviceId: string) => void;
    onHostClick: (user: User) => void;
    onAddService: () => void;
}> = (props) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
    
    const filteredServices = useMemo(() => {
        return props.services.filter(service => 
            (selectedCategory === 'all' || service.category === selectedCategory) &&
            (service.name.toLowerCase().includes(searchTerm.toLowerCase()) || service.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [props.services, searchTerm, selectedCategory]);
    
    return (
        <div className="space-y-4">
            <div className="bg-white p-2 rounded-xl shadow-sm flex items-center gap-2">
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value as ServiceCategory | 'all')} className="bg-gray-100 border-transparent rounded-md focus:ring-blue-500 text-sm">
                    <option value="all">{t('all')}</option>
                    {Object.values(ServiceCategory).map(c => <option key={c} value={c}>{t(c)}</option>)}
                </select>
                 <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder={t('servicesSearchByServiceName')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-100 border-transparent rounded-md focus:ring-blue-500 pl-10"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                 </div>
                <button onClick={props.onAddService} className="flex-shrink-0 bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition text-sm">
                    + {t('registerService')}
                </button>
            </div>
            <ServiceList 
                services={filteredServices}
                onCardClick={props.onServiceClick}
                onEditClick={props.onEditService}
                onDeleteClick={props.onDeleteService}
                onHostClick={props.onHostClick}
                usersMap={props.usersMap}
                currentUser={props.currentUser}
            />
        </div>
    );
};

interface ResourcesViewProps {
    users: User[];
    venues: Venue[];
    services: Service[];
    groups: Group[];
    usersMap: Map<string, User>;
    currentUser: User | null;
    onUserClick: (user: User) => void;
    onClubClick: (venue: Venue) => void;
    onServiceClick: (service: Service) => void;
    onGroupClick: (group: Group) => void;
    onEditService: (service: Service) => void;
    onDeleteService: (serviceId: string) => void;
    onAddCommunity: () => void;
    onAddVenue: () => void;
    onAddService: () => void;
    onHostClick: (user: User) => void;
}

const ResourcesView: React.FC<ResourcesViewProps> = (props) => {
    const { t } = useLanguage();

    const tabs: Tab[] = [
        {
            id: 'community',
            label: t('community'),
            content: <CommunityListView groups={props.groups} currentUser={props.currentUser} onGroupClick={props.onGroupClick} onAddCommunity={props.onAddCommunity} />
        },
        {
            id: 'venues',
            label: t('venues'),
            content: <VenuesView venues={props.venues} onClubClick={props.onClubClick} onAddVenue={props.onAddVenue} />
        },
        {
            id: 'services',
            label: t('services'),
            content: <ServicesView {...props} onAddService={props.onAddService} />
        },
        {
            id: 'people',
            label: t('people'),
            content: <PeopleView users={props.users} onUserClick={props.onUserClick} />
        }
    ];

    return (
      <div>
        <SwipeableTabView tabs={tabs} stickyHeader />
      </div>
    );
};

export default ResourcesView;
