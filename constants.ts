import { User, SocialPlatform, EventType, Venue, Region, Service, Post, Gender, UserRole, ServiceCategory, ReactionType, Notification as AppNotification, NotificationType, Conversation, Group, PostCategory, Milonga, Class, Workshop, ClassSession } from './types';

// MALE_AVATAR_URL, FEMALE_AVATAR_URL, and DEFAULT_USER_PHOTO_URL constants.
export const MALE_AVATAR_URL = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iIzNiODJmNiI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNMTUuNzUgNmEzLjc1IDMuNzUgMCAxMS03LjUgMCAzLjc1IDMuNzUgMCAwMTcuNSAwek00LjUwMSAyMC4xMThhNy41IDcuNSAwIDAxMTQuOTk4IDBBMTcuOTMzIDE3LjkzMyAwIDAxMTIgMjEuNzVjLTIuNjc2IDAtNS4yMTYtLjU4NC03LjQ5OS0xLjYzMnoiIC8+PC9zdmc+`;
export const FEMALE_AVATAR_URL = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZT0iI2VjNDg5OSI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNMTUuNzUgNmEzLjc1IDMuNzUgMCAxMS03LjUgMCAzLjc1IDMuNzUgMCAwMTcuNSAwek00LjUwMSAyMC4xMThhNy41IDcuNSAwIDAxMTQuOTk4IDBBMTcuOTMzIDE3LjkzMyAwIDAxMTIgMjEuNzVjLTIuNjc2IDAtNS4yMTYtLjU4NC03LjQ5OS0xLjYzMnoiIC8+PC9zdmc+`;
export const DEFAULT_USER_PHOTO_URL = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop`;
export const DEFAULT_POSTER_URL = 'data:image/svg+xml,%3Csvg%20width%3D%2290%22%20height%3D%22160%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%2290%22%20height%3D%22160%22%20fill%3D%22%23e5e7eb%22%2F%3E%3C%2Fsvg%3E';

export const COUNTRIES = [
  // Preferred
  { name: 'South Korea', nameKo: '대한민국', code: '+82', flag: 'KR' },
  { name: 'Argentina', nameKo: '아르헨티나', code: '+54', flag: 'AR' },
  { name: 'Japan', nameKo: '일본', code: '+81', flag: 'JP' },
  { name: 'United States', nameKo: '미국', code: '+1', flag: 'US' },
  { name: 'China', nameKo: '중국', code: '+86', flag: 'CN' },
  { name: 'Taiwan', nameKo: '대만', code: '+886', flag: 'TW' },
  { name: 'Singapore', nameKo: '싱가포르', code: '+65', flag: 'SG' },
  { name: 'Italy', nameKo: '이탈리아', code: '+39', flag: 'IT' },
  { name: 'Turkey', nameKo: '터키', code: '+90', flag: 'TR' },
  { name: 'United Kingdom', nameKo: '영국', code: '+44', flag: 'GB' },
  // Alphabetical
  { name: 'Afghanistan', nameKo: '아프가니스탄', code: '+93', flag: 'AF' },
  { name: 'Albania', nameKo: '알바니아', code: '+355', flag: 'AL' },
  { name: 'Algeria', nameKo: '알제리', code: '+213', flag: 'DZ' },
  { name: 'Andorra', nameKo: '안도라', code: '+376', flag: 'AD' },
  { name: 'Angola', nameKo: '앙골라', code: '+244', flag: 'AO' },
  { name: 'Australia', nameKo: '호주', code: '+61', flag: 'AU' },
  { name: 'Austria', nameKo: '오스트리아', code: '+43', flag: 'AT' },
  { name: 'Brazil', nameKo: '브라질', code: '+55', flag: 'BR' },
  { name: 'Canada', nameKo: '캐나다', code: '+1', flag: 'CA' },
  { name: 'France', nameKo: '프랑스', code: '+33', flag: 'FR' },
  { name: 'Germany', nameKo: '독일', code: '+49', flag: 'DE' },
  { name: 'Greece', nameKo: '그리스', code: '+30', flag: 'GR' },
  { name: 'India', nameKo: '인도', code: '+91', flag: 'IN' },
  { name: 'Mexico', nameKo: '멕시코', code: '+52', flag: 'MX' },
  { name: 'Netherlands', nameKo: '네덜란드', code: '+31', flag: 'NL' },
  { name: 'New Zealand', nameKo: '뉴질랜드', code: '+64', flag: 'NZ' },
  { name: 'Norway', nameKo: '노르웨이', code: '+47', flag: 'NO' },
  { name: 'Portugal', nameKo: '포르투갈', code: '+351', flag: 'PT' },
  { name: 'Russia', nameKo: '러시아', code: '+7', flag: 'RU' },
  { name: 'Spain', nameKo: '스페인', code: '+34', flag: 'ES' },
  { name: 'Sweden', nameKo: '스웨덴', code: '+46', flag: 'SE' },
  { name: 'Switzerland', nameKo: '스위스', code: '+41', flag: 'CH' },
  { name: 'Ukraine', nameKo: '우크라이나', code: '+380', flag: 'UA' },
  { name: 'Vietnam', nameKo: '베트남', code: '+84', flag: 'VN' },
];

// --- KST-based Date Utilities ---
// All date operations MUST use these functions to ensure consistency with Korea Standard Time.

// Base timestamp for data generation to ensure consistency across reloads.
const NOW = new Date();

// Formats a Date object into a 'YYYY-MM-DD' string in KST. This is the canonical way to get a date string.
const toYYYYMMDD = (date: Date): string => {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(date);
};

// Adds a number of days to a Date object.
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

// Gets the 'YYYY-MM-DD' string for the next occurrence of a specific day of the week (0=Sun, 1=Mon...).
// If today in KST is Tuesday and dayOfWeek is 2 (Tuesday), it returns today's date string.
const getNextDayOfWeek = (dayOfWeek: number, fromDate: Date = NOW): string => {
    const fromDateInKST = new Date(fromDate.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const currentKSTDay = fromDateInKST.getDay();
    
    let diff = dayOfWeek - currentKSTDay;
    if (diff < 0) {
        diff += 7;
    }
    
    const resultDate = new Date(fromDateInKST);
    resultDate.setDate(fromDateInKST.getDate() + diff);
    
    return toYYYYMMDD(resultDate);
};

// Gets the Date for the next occurrence of a specific day of the week (0=Sun, 1=Mon...).
// If today in KST is Tuesday and dayOfWeek is 2 (Tuesday), it returns today's date.
const getNextDateForDayOfWeek = (dayOfWeek: number, fromDate: Date = NOW): Date => {
    const fromDateInKST = new Date(fromDate.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const currentKSTDay = fromDateInKST.getDay();
    
    let diff = dayOfWeek - currentKSTDay;
    if (diff < 0) {
        diff += 7;
    }
    
    const resultDate = new Date(fromDateInKST);
    resultDate.setDate(fromDateInKST.getDate() + diff);
    
    return resultDate;
};


// --- Data Generation Helpers ---
const regions = Object.values(Region);
const genders = Object.values(Gender);

const sampleMaleNames = ['Alex', 'Ben', 'Chris', 'David', 'Ethan', 'Frank', 'George', 'Henry', 'Ian', 'Jack', 'Kevin', 'Leo', 'Max', 'Noah', 'Oscar', 'Paul', 'Quinn', 'Ryan', 'Sam', 'Tom', 'Victor', 'Will', 'Yoon', 'Zane', 'Daniel', 'Eric', 'Jin', 'Ken', 'Luke', 'Mike'];
const sampleFemaleNames = ['Alice', 'Bella', 'Chloe', 'Daisy', 'Ella', 'Fiona', 'Grace', 'Hannah', 'Isabella', 'Jane', 'Kate', 'Lily', 'Mia', 'Nora', 'Olivia', 'Penny', 'Queenie', 'Rose', 'Sophia', 'Tina', 'Victoria', 'Wendy', 'Yuna', 'Zoe', 'Anna', 'Emily', 'Joy', 'Karen', 'Laura', 'Mina'];
const sampleKoreanMaleNicknames = ['준서', '도윤', '서준', '하준', '시우', '지호', '은우', '유준', '선우', '민준', '강민', '태양', '진우', '현우', '성민'];
const sampleKoreanFemaleNicknames = ['서아', '하윤', '지안', '서윤', '하은', '지우', '아린', '하린', '수아', '지유', '예나', '유나', '채원', '가은', '민서'];
const samplePhotos = [
    // Men
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1595152772295-21899118504e?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?q=80&w=400&auto=format&fit=crop',
    // Women
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531746020798-1b1208a9b9a7?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1593104547489-5cfb3839a3b5?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1521146764736-56c929d59c83?q=80&w=400&auto=format&fit=crop',
];
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date): string => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

export const USERS: User[] = [
    { id: 'user1', nickname: 'Stone', nativeNickname: '스톤', countryCode: '+82', phoneNumber: '10-7209-2468', isPhonePublic: true, photoUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=400&auto=format&fit=crop', socialLinks: [{ platform: SocialPlatform.Web, url: 'https://freestyletango.com' }, {platform: SocialPlatform.Instagram, url: 'https://instagram.com/stonehong'}], createdAt: '2023-10-26T10:00:00Z', gender: Gender.Tanguero, roles: [UserRole.SystemAdmin, UserRole.Admin, UserRole.Instructor, UserRole.Organizer], favoriteRegion: Region.SeoulHongdae, isOnline: true, points: 1250 },
    { id: 'user2', nickname: 'Aran', nativeNickname: '아란', countryCode: '+82', phoneNumber: '10-1234-5678', isPhonePublic: true, photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop', socialLinks: [], createdAt: '2023-10-25T11:00:00Z', gender: Gender.Tanguera, roles: [UserRole.Instructor, UserRole.Organizer], favoriteRegion: Region.SeoulGangnam, isOnline: true, points: 800 },
    { id: 'user3', nickname: 'Semrose', nativeNickname: '샘로즈', countryCode: '+82', phoneNumber: '10-2345-6789', isPhonePublic: false, photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop', socialLinks: [], createdAt: '2023-10-24T12:00:00Z', gender: Gender.Tanguera, roles: [UserRole.Instructor, UserRole.Organizer], favoriteRegion: Region.Busan, isOnline: false, points: 550 },
    { id: 'user4', nickname: 'Goni', nativeNickname: '고니', countryCode: '+82', phoneNumber: '10-3456-7890', isPhonePublic: true, photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop', socialLinks: [], createdAt: '2023-10-23T13:00:00Z', gender: Gender.Tanguero, roles: [UserRole.Instructor], isOnline: true, points: 420 },
    { id: 'user5', nickname: 'StarShadow', nativeNickname: '별그림자', countryCode: '+82', phoneNumber: '10-4567-8901', isPhonePublic: false, photoUrl: 'https://images.unsplash.com/photo-1491349174775-aaafddd81942?q=80&w=400&auto=format&fit=crop', socialLinks: [], createdAt: '2023-10-22T14:00:00Z', gender: Gender.Tanguera, roles: [UserRole.Organizer], isOnline: false, points: 300 },
    { id: 'user6', nickname: 'Scarlet', nativeNickname: '스칼렛', countryCode: '+82', phoneNumber: '10-5678-9012', isPhonePublic: true, photoUrl: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?q=80&w=400&auto=format&fit=crop', socialLinks: [], createdAt: '2023-10-21T15:00:00Z', gender: Gender.Tanguera, roles: [UserRole.Instructor, UserRole.ServiceProvider], isOnline: true, points: 250 },
    { id: 'user7', nickname: 'Eva', nativeNickname: '에바', countryCode: '+1', phoneNumber: '212-555-0123', isPhonePublic: false, photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop', socialLinks: [], createdAt: '2023-10-20T16:00:00Z', gender: Gender.Tanguera, roles: [UserRole.ServiceProvider], isOnline: false, points: 150 },
    { id: 'user8', nickname: 'Allegro', nativeNickname: '알레그로', countryCode: '+54', phoneNumber: '11-4555-0199', isPhonePublic: true, photoUrl: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?q=80&w=400&auto=format&fit=crop', socialLinks: [], createdAt: '2023-10-19T17:00:00Z', gender: Gender.Tanguero, roles: [UserRole.DJ], isOnline: true, points: 700 },
    { id: 'user9', nickname: 'Tiffany', nativeNickname: '티파니', countryCode: '+81', phoneNumber: '80-1234-5678', isPhonePublic: true, photoUrl: 'https://images.unsplash.com/photo-1552960562-daf630e9278b?q=80&w=400&auto=format&fit=crop', socialLinks: [], createdAt: '2023-10-18T18:00:00Z', gender: Gender.Tanguera, roles: [UserRole.Tangueros, UserRole.ServiceProvider], isOnline: false, points: 120 },
    { id: 'user10', nickname: 'Sophia', nativeNickname: '소피아', countryCode: '+39', phoneNumber: '333-1234567', isPhonePublic: false, photoUrl: 'https://images.unsplash.com/photo-1520466809213-7b9a56adcd45?q=80&w=400&auto=format&fit=crop', socialLinks: [], createdAt: '2023-10-17T19:00:00Z', gender: Gender.Tanguera, roles: [UserRole.ServiceProvider], isOnline: true, points: 90 },
    { id: 'user11', nickname: 'El Mago', nativeNickname: '엘 마고', countryCode: '+54', phoneNumber: '11-5555-1234', isPhonePublic: true, photoUrl: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=400&auto=format&fit=crop', socialLinks: [], createdAt: '2023-09-10T10:00:00Z', gender: Gender.Tanguero, roles: [UserRole.DJ], isOnline: false, points: 980 },
    { id: 'user12', nickname: 'Luna', nativeNickname: '루나', countryCode: '+82', phoneNumber: '10-9876-5432', isPhonePublic: false, photoUrl: '', socialLinks: [], createdAt: '2023-09-12T10:00:00Z', gender: Gender.Tanguera, roles: [UserRole.Tangueros], isOnline: true, points: 50 },
    { id: 'user13', nickname: 'Leo', nativeNickname: '레오', countryCode: '+44', phoneNumber: '20-7946-0958', isPhonePublic: true, photoUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=400&auto=format&fit=crop', socialLinks: [], createdAt: '2023-09-15T10:00:00Z', gender: Gender.Tanguero, roles: [UserRole.TranslatorEN], isOnline: true, points: 180 },
    { id: 'user14', nickname: 'Isabella', nativeNickname: '이사벨라', countryCode: '+34', phoneNumber: '911-23-54-00', isPhonePublic: true, photoUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=400&auto=format&fit=crop', socialLinks: [], createdAt: '2023-09-18T10:00:00Z', gender: Gender.Tanguera, roles: [UserRole.TranslatorES], isOnline: false, points: 220 },
    ...Array.from({ length: 90 }, (_, i) => {
        const gender = getRandomItem(genders);
        const isMale = gender === Gender.Tanguero;
        const nickname = isMale ? getRandomItem(sampleMaleNames) : getRandomItem(sampleFemaleNames);
        const nativeNickname = isMale ? getRandomItem(sampleKoreanMaleNicknames) : getRandomItem(sampleKoreanFemaleNicknames);
        const country = getRandomItem(COUNTRIES);
        const roles = i % 10 === 0 ? [getRandomItem([UserRole.DJ, UserRole.Instructor, UserRole.Organizer, UserRole.ServiceProvider])] : [UserRole.Tangueros];

        return {
            id: `user${i + 15}`,
            nickname: `${nickname}${i % 7 === 0 ? i+1 : ''}`,
            nativeNickname: `${nativeNickname}${i % 5 === 0 ? i+1 : ''}`,
            countryCode: country.code,
            phoneNumber: `10-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
            isPhonePublic: Math.random() > 0.5,
            photoUrl: i % 4 === 0 ? '' : getRandomItem(samplePhotos),
            socialLinks: [],
            createdAt: getRandomDate(new Date(2023, 0, 1), new Date()),
            gender,
            roles,
            favoriteRegion: getRandomItem(regions),
            isOnline: Math.random() > 0.4,
            points: Math.floor(Math.random() * 500),
        };
    })
];

export const VENUES: Venue[] = [
    { id: 'venue1', name: '프리스타일 (Freestyle Tango)', address: '서울 마포구 와우산로 15길 12, 3층', region: Region.SeoulHongdae, creatorId: 'user1', imageUrls: ['https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1578721346306-a5b17846554b?q=80&w=800&auto=format&fit=crop'] },
    { id: 'venue2', name: '라벤따나 (La Ventana)', address: '서울 강남구 강남대로 118길 20, B1', region: Region.SeoulGangnam, creatorId: 'user2', imageUrls: ['https://images.unsplash.com/photo-1563720231991-285620951556?q=80&w=800&auto=format&fit=crop'] },
    { id: 'venue3', name: '엘불린 (El Bulin)', address: '부산 부산진구 중앙대로 680번길 12, 5층', region: Region.Busan, creatorId: 'user3', imageUrls: ['https://images.unsplash.com/photo-1519671482749-fd09be7c27c2?q=80&w=800&auto=format&fit=crop'] },
    { id: 'venue4', name: '오초 (Ocho)', address: '서울 서초구 서초대로 77길 24, B1', region: Region.SeoulGangnam, creatorId: 'user2', imageUrls: ['https://images.unsplash.com/photo-1579745101689-8a8e021c21e6?q=80&w=800&auto=format&fit=crop'] },
    { id: 'venue5', name: '아따니체 (Ataniche)', address: '서울 마포구 독막로 7길 20, 4층', region: Region.SeoulHongdae, creatorId: 'user1', imageUrls: ['https://images.unsplash.com/photo-1542037104-924839929659?q=80&w=800&auto=format&fit=crop'] },
    { id: 'venue6', name: '탱고 델 알마 (Tango del Alma)', address: '대구 중구 국채보상로 582, 3층', region: Region.Daegu, creatorId: 'user5', imageUrls: ['https://images.unsplash.com/photo-1504333638930-c8787321eee0?q=80&w=800&auto=format&fit=crop'] },
    { id: 'venue7', name: '라임 Luz Y Sombra', address: '대전 서구 둔산로 31, 4층', region: Region.Daejeon, creatorId: 'user5', imageUrls: ['https://images.unsplash.com/photo-1552825229-875b0be90443?q=80&w=800&auto=format&fit=crop'] },
    { id: 'venue8', name: '땅고 오누르 (Tango O-neur)', address: '광주 동구 중앙로 160번길 31-4, 2층', region: Region.Gwangju, creatorId: 'user5', imageUrls: ['https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=800&auto=format&fit=crop'] },
    { id: 'venue9', name: '보니따 (Bonita)', address: '인천 부평구 부평대로 32, 5층', region: Region.Incheon, creatorId: 'user5', imageUrls: ['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop'] },
    { id: 'venue10', name: 'Studio Sol', address: '수원 팔달구 향교로 1-1, 3층', region: Region.Suwon, creatorId: 'user5', imageUrls: ['https://images.unsplash.com/photo-1588702547919-26089e690ecc?q=80&w=800&auto=format&fit=crop'] },
    ...Array.from({ length: 40 }, (_, i) => {
        const region = regions[i % regions.length];
        return { 
            id: `venue${i + 11}`, 
            name: `탱고 플레이스 ${i+1}`, 
            address: `${region} 어딘가 ${i+1}번지`, 
            region: region, 
            creatorId: `user${(i%10) + 1}`,
            imageUrls: [`https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=800&auto=format&fit=crop&h=${800+i}`] 
        }
    })
];


const generateRecurringMilongas = (
    seriesId: string,
    dayOfWeek: number,
    baseData: Omit<Milonga, 'id' | 'date' | 'seriesId'>,
    weeks: number = 8
): Milonga[] => {
    const instances: Milonga[] = [];
    const firstDate = getNextDateForDayOfWeek(dayOfWeek);

    for (let i = 0; i < weeks; i++) {
        const date = toYYYYMMDD(addDays(firstDate, i * 7));
        instances.push({
            ...baseData,
            id: `${seriesId}-${i}`,
            seriesId: seriesId,
            date: date,
        });
    }
    return instances;
}

export const MILONGAS: Milonga[] = [
    // Special Milongas & Events
    { id: 'mil-sp-1', title: 'Tango Korea 그란 밀롱가', type: EventType.Milonga, date: toYYYYMMDD(addDays(NOW, 10)), startTime: '19:00', endTime: '01:00', venueId: 'venue1', creatorId: 'user1', providerIds: ['user1'], posterImageUrl: 'https://images.unsplash.com/photo-1594121708314-b1b7a2d42c34?q=80&w=800&h=1422&auto=format&fit=crop', description: '최고의 디제이와 함께하는 스페셜 그란 밀롱가. 드레스 코드는 블랙&레드.', hasSignUp: true, signUpDescription: '선착순 20명 특별 선물 증정!', maxAttendees: 100, participants: USERS.slice(80, 100).map(u=>u.id), inquiries: [
    { id: 'inq1', authorId: 'user12', content: '테이블 예약 가능한가요? 4명입니다.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), reactions: [], replies: [
        { id: 'inq1-reply1', authorId: 'user1', content: '네, 가능합니다. DM으로 성함과 연락처 남겨주세요.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), reactions: [], replies: [] }
    ]},
    { id: 'inq2', authorId: 'user13', content: '주차 지원 되나요?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), reactions: [], replies: [] }
] },
    { id: 'mil-sp-2', title: '갈라 밀롱가 w/ 라이브 오케스트라', type: EventType.Milonga, date: toYYYYMMDD(addDays(NOW, 25)), startTime: '20:00', endTime: '02:00', venueId: 'venue2', creatorId: 'user2', providerIds: ['user2'], posterImageUrl: 'https://images.unsplash.com/photo-1583795319584-3ac27b03a628?q=80&w=800&h=1422&auto=format&fit=crop', description: '라이브 오케스트라 연주와 함께하는 특별한 갈라 밀롱가.' },
    { id: 'mil-sp-3', title: '루프탑 탱고 파티', type: EventType.Milonga, date: toYYYYMMDD(addDays(NOW, -15)), startTime: '18:00', endTime: '23:00', venueId: 'venue10', creatorId: 'user5', providerIds: ['user5'], posterImageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800&h=1422&auto=format&fit=crop', description: '수원의 야경과 함께하는 루프탑 탱고 파티! (지난 이벤트)' },
    
    // Recurring Milongas (Generated as separate instances)
    ...generateRecurringMilongas('mil-rec-tue', 2, { title: '프리스타일 화요밀롱가', type: EventType.Milonga, startTime: '20:00', endTime: '00:00', venueId: 'venue1', creatorId: 'user1', providerIds: ['user1'], djId: 'user8', description: '홍대의 중심, 프리스타일에서 펼쳐지는 열정적인 화요일 밤!', posterImageUrl: 'https://images.unsplash.com/photo-1608229245362-6b3a3a0e4c6b?q=80&w=800&h=1422&auto=format&fit=crop', generalAttendees: USERS.slice(10, 45).map(u => u.id), interestedAttendees: USERS.slice(50, 60).map(u => u.id) }),
    ...generateRecurringMilongas('mil-rec-sat', 6, { title: '라벤따나 토요밀롱가', type: EventType.Milonga, startTime: '20:00', endTime: '02:00', venueId: 'venue2', creatorId: 'user2', providerIds: ['user2'], description: '강남의 핫플레이스 라벤따나에서 즐기는 우아한 토요일!', posterImageUrl: 'https://images.unsplash.com/photo-1508056213491-b519e4b6c205?q=80&w=800&h=1422&auto=format&fit=crop', generalAttendees: USERS.slice(20, 80).map(u => u.id) }),
    ...generateRecurringMilongas('mil-rec-fri', 5, { title: '엘불린 금요밀롱가', type: EventType.Milonga, startTime: '21:00', endTime: '01:00', venueId: 'venue3', creatorId: 'user3', providerIds: ['user3'], description: '부산의 밤을 탱고로! 엘불린의 금요일은 언제나 뜨겁습니다.', posterImageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800&h=1422&auto=format&fit=crop', generalAttendees: USERS.slice(5, 25).map(u => u.id) }),
    ...generateRecurringMilongas('mil-rec-sun', 0, { title: '오초 일요밀롱가', type: EventType.Milonga, startTime: '18:00', endTime: '23:00', venueId: 'venue4', creatorId: 'user2', providerIds: ['user2'], description: '한 주의 마무리는 오초에서 편안한 탱고와 함께.', posterImageUrl: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=800&h=1422&auto=format&fit=crop', generalAttendees: USERS.slice(30, 50).map(u => u.id) }),
    ...generateRecurringMilongas('mil-rec-wed', 3, { title: '아따니체 수요밀롱가', type: EventType.Milonga, startTime: '20:30', endTime: '00:30', venueId: 'venue5', creatorId: 'user1', providerIds: ['user1'], djId: 'user11', description: '주중의 활력소! 아따니체에서 재충전하세요.', posterImageUrl: 'https://images.unsplash.com/photo-1546221523-1434b5a2a255?q=80&w=800&h=1422&auto=format&fit=crop', generalAttendees: USERS.slice(15, 35).map(u => u.id) }),
    ...generateRecurringMilongas('mil-rec-thu', 4, { title: '델알마 목요밀롱가', type: EventType.Milonga, startTime: '20:00', endTime: '23:30', venueId: 'venue6', creatorId: 'user5', providerIds: ['user5'], description: '대구 탱고의 중심, 델알마에서 만나요.', posterImageUrl: 'https://images.unsplash.com/photo-1520038410233-7141be7e6f97?q=80&w=800&h=1422&auto=format&fit=crop', generalAttendees: USERS.slice(40, 55).map(u => u.id) }),
    ...generateRecurringMilongas('mil-rec-mon', 1, { title: '보니따 월요연습', type: EventType.Milonga, startTime: '19:00', endTime: '22:00', venueId: 'venue9', creatorId: 'user5', providerIds: ['user5'], description: '월요일은 보니따에서 함께 연습해요! (쁘락띠까)', posterImageUrl: 'https://images.unsplash.com/photo-1562013327-779a7813a29f?q=80&w=800&h=1422&auto=format&fit=crop', generalAttendees: USERS.slice(60, 70).map(u => u.id) }),
];

export const CLASSES: Class[] = Array.from({ length: 25 }, (_, i) => {
    const creator = USERS.find(u => u.roles.includes(UserRole.Instructor) && u.id === `user${(i % 5) + 1}`) || USERS[1];
    const venue = VENUES[i % VENUES.length];
    const startDayOfWeek = i % 7;
    const classStartDate = addDays(NOW, 7 + (i*2));
    
    const sessions: ClassSession[] = [0, 7, 14, 21].map(d => {
        const date = toYYYYMMDD(addDays(getNextDateForDayOfWeek(startDayOfWeek, classStartDate), d));
        const startTime = `${18 + (i%3)}:00`;
        const endTime = `${20 + (i%3)}:00`;
        return { date, startTime, endTime };
    });
    
    return {
        id: `class-${i+1}`,
        title: `${creator.nativeNickname}의 ${['초급', '중급', '초중급', '상급', '밀롱가'][i % 5]} 클래스`,
        type: EventType.Class,
        sessions: sessions,
        venueId: venue.id,
        creatorId: creator.id,
        description: `탱고의 ${['기초', '리듬', '테크닉', '표현', '실전'][i%5]}을(를) 체계적으로 배워봅시다. 4주 과정입니다.`,
        posterImageUrl: `https://images.unsplash.com/photo-1517404215738-15263e9f9178?q=80&w=800&h=1422&auto=format&fit=crop&${i}`,
        imageUrls: [`https://source.unsplash.com/800x600/?tango,dance,${i}`]
    }
});

export const WORKSHOPS: Workshop[] = Array.from({ length: 15 }, (_, i) => {
    const creator = USERS.find(u => u.roles.includes(UserRole.Organizer)) || USERS[i % 10];
    const venue = VENUES[i % VENUES.length];
    const startDate = addDays(NOW, 30 + i * 10);
    const duration = (i % 3) + 1; // 1 to 3 days
    const endDate = addDays(startDate, duration - 1);
    return {
        id: `workshop-${i+1}`,
        title: `스페셜 워크샵: ${['커넥션', '뮤지컬리티', '사까다', '볼레오', '히로'][i%5]}`,
        type: EventType.Workshop,
        dates: [toYYYYMMDD(startDate), toYYYYMMDD(endDate)],
        venueId: venue.id,
        creatorId: creator.id,
        description: '세계적인 마에스트로와 함께하는 집중 워크샵. 탱고 실력을 한 단계 업그레이드할 수 있는 기회입니다.',
        maxAttendees: 20 + (i%4 * 5),
        detailsUrl: 'https://example.com/details',
        signUpUrl: 'https://example.com/signup',
        imageUrls: [`https://source.unsplash.com/800x600/?workshop,learning,${i}`]
    }
});

export const SERVICES: Service[] = [
    { id: 'service1', name: '에바의 게스트하우스', category: ServiceCategory.Lodging, region: Region.SeoulHongdae, hostId: 'user7', imageUrls: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop'], price: '60,000원/박', description: '프리스타일 탱고에서 도보 5분 거리. 연습실 완비!', unavailableDates: [toYYYYMMDD(addDays(NOW, 3)), toYYYYMMDD(addDays(NOW, 4))] },
    { id: 'service2', name: '스칼렛 탱고 슈즈', category: ServiceCategory.Shoes, region: Region.SeoulGangnam, hostId: 'user6', imageUrls: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop'], price: '180,000원부터', description: '당신의 발에 꼭 맞는 수제화. 편안함과 스타일을 동시에.' },
    { id: 'service3', name: '소피아 탱고 드레스', category: ServiceCategory.Dress, region: Region.Busan, hostId: 'user10', imageUrls: ['https://images.unsplash.com/photo-1505391629854-529a173c5de8?q=80&w=800&auto=format&fit=crop'], price: '주문 제작', description: '밀롱가에서 당신을 가장 빛나게 할 드레스.' },
    { id: 'service4', name: '티파니 뷰티 살롱', category: ServiceCategory.HairBeauty, region: Region.SeoulHongdae, hostId: 'user9', imageUrls: ['https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=800&auto=format&fit=crop'], price: '상담 후 결정', description: '탱고 헤어 & 메이크업 전문. 특별한 날을 위해.' },
    ...Array.from({ length: 20 }, (_, i) => {
        const host = USERS.find(u => u.roles.includes(UserRole.ServiceProvider)) || USERS[i % 20 + 10];
        const category = Object.values(ServiceCategory)[i % 4];
        const region = regions[i % regions.length];
        return {
            id: `service${i + 5}`,
            name: `${host.nativeNickname}님의 ${category} 서비스`,
            category,
            region,
            hostId: host.id,
            imageUrls: [`https://source.unsplash.com/800x600/?${['bedroom', 'shoes', 'dress', 'makeup'][i%4]},${i}`],
            price: `${(5 + i) * 10000}원`,
            description: `${region}의 탱게로스를 위한 퀄리티 서비스입니다.`
        };
    })
];

export const POSTS: Post[] = [
    { id: 'post1', authorId: 'user2', content: '이번 주 토요일 라벤따나 밀롱가에서 만나요! 스페셜 디제이 알레그로와 함께합니다. 놓치지 마세요!', imageUrls: ['https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800&auto=format&fit=crop'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), reactions: [{ userId: 'user1', type: ReactionType.Like }, { userId: 'user3', type: ReactionType.Love }, { userId: 'user4', type: ReactionType.Wow }, { userId: 'user5', type: ReactionType.Like }], comments: [{ id: 'c1', authorId: 'user1', content: '기대됩니다!', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), reactions: [{userId: 'user2', type: ReactionType.Like}], replies: [{ id: 'c2', authorId: 'user2', content: '네, 꼭 오세요!', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), reactions: [], replies: [] }] }], category: PostCategory.Tango, viewCount: 1843 },
    { id: 'post2', authorId: 'user6', content: '새로운 탱고 슈즈 컬렉션이 입고되었습니다. 스칼렛 탱고 슈즈에서 직접 신어보세요.', imageUrls: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d34?q=80&w=800&auto=format&fit=crop'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), reactions: [{ userId: 'user2', type: ReactionType.Wow }, { userId: 'user7', type: ReactionType.Love }], comments: [], category: PostCategory.Tango, viewCount: 742 },
    { id: 'post3', authorId: 'user1', title: '프리스타일 탱고 워크샵 공지!', content: '1. 초급반 모집\n2. 중급반 테크닉\n자세한 내용은 웹사이트를 참고하세요.', createdAt: '2025-09-11T10:00:00Z', reactions: [], comments: [{ id: 'c3', authorId: 'user4', content: '신청했습니다!', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), reactions: [], replies: [] }], isNotice: true, groupId: 'group1', category: PostCategory.Tango, viewCount: 2580, isPinned: true },
    { id: 'post4', authorId: 'user8', videoUrl: 'https://www.youtube.com/watch?v=v8a1vcmfL7U', content: '이번주 금요일 엘불린에서 플레이할 음악 살짝 스포일러!', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), reactions: USERS.slice(10, 20).map(u => ({ userId: u.id, type: getRandomItem(Object.values(ReactionType)) })), comments: [], category: PostCategory.Video, viewCount: 3105 },
    { id: 'post5', authorId: 'user13', content: '방금 서울에 도착했어요! 오늘 밤 밀롱가 추천 좀 해주세요.', createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), reactions: [], comments: [], category: PostCategory.Tango, viewCount: 98 },
    { id: 'post6', authorId: 'user3', content: '부산 탱고인들 모여라! 이번 주말 해변에서 야외 탱고 어떠세요?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), reactions: [], comments: [], groupId: 'group2', category: PostCategory.Tango, viewCount: 433 },
    { id: 'post-attitude-1', authorId: 'user12', content: '요즘 탱고 추면서 너무 힘든 점이 있는데... 파트너를 구하기가 너무 어려워요. 제가 리드를 잘 못하는 걸까요?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), reactions: [], comments: [], category: PostCategory.Attitude, viewCount: 621 },
    { id: 'post-life-1', authorId: 'user7', content: '제주도 여행 다녀왔어요! 맛있는 것도 많이 먹고 힐링 제대로 하고 왔네요. #여행 #제주', imageUrls: ['https://images.unsplash.com/photo-1579169825453-8d4b4653cc2c?q=80&w=800&auto=format&fit=crop'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), reactions: [], comments: [], category: PostCategory.Life, viewCount: 154 },
    { id: 'post-attitude-2', authorId: 'user4', content: '가끔 밀롱가에서 원치 않는 땅따를 받으면 어떻게 거절해야 할지 모르겠어요. 기분 나쁘지 않게 거절하는 좋은 방법이 있을까요?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), reactions: [], comments: [], category: PostCategory.Attitude, viewCount: 890 },
    { id: 'post-carrot-1', authorId: 'user9', content: '거의 새것 같은 꼼데가르송 탱고 슈즈 팝니다. 245mm. DM 주세요.', imageUrls: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), reactions: [], comments: [], category: PostCategory.CarrotMarket, forSaleStatus: 'forSale', viewCount: 321 },
    { id: 'post-carrot-2', authorId: 'user10', content: '밀롱가에서 한 번 입은 드레스. 이제 작아서 못입어요 ㅠㅠ', imageUrls: ['https://images.unsplash.com/photo-1505391629854-529a173c5de8?q=80&w=800&auto=format&fit=crop'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), reactions: [], comments: [], category: PostCategory.CarrotMarket, forSaleStatus: 'sold', viewCount: 450 },
    { id: 'post-music-1', authorId: 'user8', content: 'Tango Music 추천: Osvaldo Pugliese - "Recuerdo". 가슴을 울리는 반도네온 선율이 일품입니다.', linkUrls: ['https://www.youtube.com/watch?v=zGFue5yV_zE'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), reactions: [], comments: [], category: PostCategory.TangoMusic, viewCount: 288 },
    { id: 'post-music-2', authorId: 'user11', content: '리듬감을 살리고 싶을 때 듣는 Juan D\'Arienzo의 "La Cumparsita"! 플로어의 왕과 함께 달려보세요.', linkUrls: ['https://www.youtube.com/watch?v=F33t2rL2c_4'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), reactions: [], comments: [], category: PostCategory.TangoMusic, viewCount: 356 },
    { id: 'post-youtube-1', authorId: 'user2', content: '탱고 스텝 연습에 도움이 되는 유튜브 채널을 발견했어요! 기본기 다지기에 최고입니다. #탱고연습 #유튜브추천', linkUrls: ['https://www.youtube.com/watch?v=N8hEwn3Iu5s'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), reactions: [], comments: [], category: PostCategory.Youtube, viewCount: 782 },
    { id: 'post-youtube-2', authorId: 'user12', content: '제가 정말 좋아하는 탱고 공연 영상이에요. 두 댄서의 케미가 정말 멋져요. 한번 보세요!', videoUrl: 'https://www.youtube.com/watch?v=v8a1vcmfL7U', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), reactions: [], comments: [], category: PostCategory.Youtube, viewCount: 931 },
    ...Array.from({ length: 35 }, (_, i) => {
        const author = getRandomItem(USERS);
        const hasImage = Math.random() > 0.4;
        const hasLink = Math.random() > 0.8;
        const categories = [PostCategory.Tango, PostCategory.Life, PostCategory.Video, PostCategory.Attitude];
        const category = getRandomItem(categories);
        return {
            id: `post${i + 7}`,
            authorId: author.id,
            content: `이것은 샘플 포스트 ${i+1}번 입니다. 탱고 춥시다! #탱고 #${getRandomItem(regions)}`,
            imageUrls: hasImage && category !== PostCategory.Video ? [`https://source.unsplash.com/800x600/?dance,${i}`] : undefined,
            videoUrl: category === PostCategory.Video ? 'https://www.youtube.com/watch?v=v8a1vcmfL7U' : undefined,
            linkUrls: hasLink ? ['https://tango.info'] : undefined,
            createdAt: getRandomDate(new Date(2023, 6, 1), new Date()),
            reactions: USERS.slice(0, Math.floor(Math.random() * 20)).map(u => ({ userId: u.id, type: getRandomItem(Object.values(ReactionType)) })),
            comments: [],
            category: category,
            viewCount: Math.floor(Math.random() * 1500),
        }
    })
];

export const GROUPS: Group[] = [
  { id: 'group1', name: '서울 탱고 초급 스터디', description: '탱고를 처음 시작하는 분들을 위한 스터디 그룹입니다.', clubId: 'venue1', imageUrls: ['https://images.unsplash.com/photo-1552825229-875b0be90443?q=80&w=800&auto=format&fit=crop'], memberIds: USERS.slice(0,25).map(u=>u.id), creatorId: 'user1', staffIds: ['user2', 'user3'], createdAt: '2023-10-20T10:00:00Z', requiresApproval: true },
  { id: 'group2', name: '부산 주말 밀롱가 메이트', description: '부산 지역에서 주말에 함께 밀롱가를 즐길 친구들을 찾습니다.', imageUrls: ['https://images.unsplash.com/photo-1516443336423-9a397a61d670?q=80&w=800&auto=format&fit=crop'], memberIds: USERS.slice(20,45).map(u=>u.id), creatorId: 'user3', createdAt: '2023-10-18T11:00:00Z', requiresApproval: false },
  { id: 'group3', name: '탱고 DJ 스터디 그룹', description: '탱고 DJ 지망생들을 위한 그룹입니다.', imageUrls: ['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop'], memberIds: ['user1', 'user8', 'user11', 'user12', 'user16', 'user18', 'user25', 'user35'], creatorId: 'user8', createdAt: '2023-10-15T12:00:00Z', requiresApproval: true },
  { id: 'group4', name: '탱고코리아 Q&A', description: '탱고코리아 앱 사용에 대한 질문, 버그 리포트, 기능 제안 등 자유롭게 의견을 나눠주세요.', imageUrls: ['https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=800&auto=format&fit=crop'], creatorId: 'user1', memberIds: USERS.map(u => u.id), createdAt: '2023-10-01T10:00:00Z', requiresApproval: false, isPublic: true },
  ...Array.from({ length: 12 }, (_, i) => {
      const creator = getRandomItem(USERS.slice(0, 20));
      return {
          id: `group${i + 5}`,
          name: `${regions[i % regions.length]} 탱고 러버스`,
          description: `${regions[i % regions.length]} 댄서들을 위한 그룹입니다.`,
          imageUrls: [`https://source.unsplash.com/800x600/?city,${i}`],
          memberIds: USERS.slice(i * 5, i * 5 + 15).map(u => u.id),
          creatorId: creator.id,
          createdAt: getRandomDate(new Date(2023, 8, 1), new Date()),
          requiresApproval: Math.random() > 0.5,
      }
  })
];

export const NOTIFICATIONS: AppNotification[] = [
    { id: 'notif1', type: NotificationType.Like, fromUserId: 'user2', recipientId: 'user1', postId: 'post1', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: 'notif2', type: NotificationType.Comment, fromUserId: 'user3', recipientId: 'user1', postId: 'post1', commentId: 'c1', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: 'notif3', type: NotificationType.GroupRequest, fromUserId: 'user4', recipientId: 'user1', groupId: 'group1', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { id: 'notif4', type: NotificationType.GroupRequestApproved, fromUserId: 'user1', recipientId: 'user5', groupId: 'group1', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
];
export const CONVERSATIONS: Conversation[] = [
    { id: 'conv1', participantIds: ['user1', 'user2'], messages: [{ id: 'msg1', senderId: 'user2', text: 'Hey there!', createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), read: false }], lastMessageAt: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
    { id: 'conv2', participantIds: ['user1', 'user3'], messages: [{ id: 'msg2', senderId: 'user3', text: 'See you at the milonga?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), read: true }], lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
    { id: 'conv3', participantIds: ['user1', 'user4'], messages: [{ id: 'msg3', senderId: 'user4', text: 'Did you see the new post?', createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(), read: false }], lastMessageAt: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
    { id: 'conv4', participantIds: ['user1', 'user5', 'user6'], name: 'Tango Project', messages: [{ id: 'msg4', senderId: 'user5', text: 'Meeting tomorrow at 10am.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), read: false }], lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), creatorId: 'user1' },
];

// --- DYNAMIC DATA GENERATION ---

// Add more TangoMusic and Youtube posts for the '공부방' tab
POSTS.push(
    { id: 'post-music-3', authorId: 'user11', content: 'Carlos Di Sarli - "Bahía Blanca". 영혼을 위한 발라드.', linkUrls: ['https://www.youtube.com/watch?v=sdrpxa_f_G8'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(), reactions: [], comments: [], category: PostCategory.TangoMusic, viewCount: 240 },
    { id: 'post-music-4', authorId: 'user8', content: 'Aníbal Troilo - "Toda mi vida". 피치닝의 목소리가 심금을 울립니다.', linkUrls: ['https://www.youtube.com/watch?v=gGwsyY2zTzE'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(), reactions: [], comments: [], category: PostCategory.TangoMusic, viewCount: 210 },
    { id: 'post-music-5', authorId: 'user11', content: 'Ricardo Tanturi - "Recuerdo Malevo". 경쾌한 리듬에 몸을 맡겨보세요.', linkUrls: ['https://www.youtube.com/watch?v=eB12o-nAnA0'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(), reactions: [], comments: [], category: PostCategory.TangoMusic, viewCount: 180 },
    
    { id: 'post-youtube-3', authorId: 'user1', content: '탱고의 역사에 대한 다큐멘터리. 정말 유익해요!', videoUrl: 'https://www.youtube.com/watch?v=v_p86434w3nU', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), reactions: [], comments: [], category: PostCategory.Youtube, viewCount: 650 },
    { id: 'post-youtube-4', authorId: 'user5', content: '밀롱가 에티켓에 대한 영상입니다. 초보분들께 추천!', linkUrls: ['https://www.youtube.com/watch?v=3-x0w3D-T-Y'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), reactions: [], comments: [], category: PostCategory.Youtube, viewCount: 540 },
    { id: 'post-youtube-5', authorId: 'user12', content: 'Chicho Frumboli & Juana Sepulveda의 환상적인 공연. 영감이 필요할 때 보세요.', videoUrl: 'https://www.youtube.com/watch?v=v8a1vcmfL7U', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(), reactions: [], comments: [], category: PostCategory.Youtube, viewCount: 1120 }
);
POSTS.push({ id: `post-notice-group1-1`, authorId: 'user1', title: `서울 탱고 초급 스터디 까페 1번째 공지사항`, content: `2번째 공지 입니다.`, createdAt: '2025-01-27T10:00:00Z', reactions: [], comments: [], groupId: 'group1', isNotice: true, category: PostCategory.Tango, viewCount: 1500 });
POSTS.push({ id: `post-notice-group1-2`, authorId: 'user1', title: `서울 탱고 초급 스터디 까페 2번째 공지사항`, content: `3번째 공지 입니다.`, createdAt: '2023-12-14T10:00:00Z', reactions: [], comments: [], groupId: 'group1', isNotice: true, category: PostCategory.Tango, viewCount: 1800 });

// Generate posts for each group
GROUPS.forEach(group => {
    // Add 1-2 notice posts for each group
    for (let i = 0; i < 1 + Math.floor(Math.random() * 2); i++) {
        if (group.id === 'group1' && i === 0) continue; // Skip adding another notice for group1
        POSTS.push({
            id: `post-notice-${group.id}-${i}`,
            authorId: group.creatorId,
            title: `${group.name} 까페 ${i+1}번째 공지사항`,
            content: `까페 규칙을 잘 지켜 즐거운 커뮤니티를 만들어갑시다.`,
            createdAt: getRandomDate(new Date(group.createdAt), new Date()),
            reactions: [],
            comments: [],
            groupId: group.id,
            isNotice: true,
            category: PostCategory.Tango,
            viewCount: Math.floor(Math.random() * 800) + 100,
            isPinned: i === 0,
        });
    }

    // Add 3-5 feed posts for each group
    for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
        const randomMember = USERS.find(u => group.memberIds.includes(u.id)) || USERS.find(u => u.id === group.creatorId);
        POSTS.push({
            id: `post-feed-${group.id}-${i}`,
            authorId: randomMember!.id,
            content: `${group.name} 까페 멤버분들 안녕하세요! 새로 가입한 ${randomMember!.nativeNickname}입니다. 잘 부탁드립니다. 이번 주말에 밀롱가 같이 가실 분?`,
            createdAt: getRandomDate(new Date(group.createdAt), new Date()),
            reactions: [],
            comments: [],
            groupId: group.id,
            isNotice: false,
            category: PostCategory.Tango,
            viewCount: Math.floor(Math.random() * 500) + 20,
        });
    }
});

// Generate events for each group
GROUPS.forEach((group, index) => {
    for (let i = 0; i < 2; i++) {
        const creator = USERS.find(u => u.id === group.creatorId);
        // Find a venue in the same region as the group creator's favorite region
        const region = creator?.favoriteRegion || Region.SeoulHongdae;
        const venueInRegion = VENUES.find(v => v.region === region) || VENUES[0];
        
        // Schedule event in the future, spread out over the next few months
        const eventDate = addDays(NOW, 10 + (index * 7) + (i * 21));

        MILONGAS.push({
            id: `mil-group-${group.id}-${i}`,
            title: `[${group.name}] 정기 모임`,
            type: EventType.Milonga,
            date: toYYYYMMDD(eventDate),
            startTime: '20:00',
            endTime: '23:00',
            // Use the group's associated venue if it exists, otherwise use a venue in the same region
            venueId: group.clubId || venueInRegion.id,
            creatorId: group.creatorId,
            providerIds: [group.creatorId],
            groupId: group.id,
            description: `${group.name} 까페 회원들을 위한 정기 밀롱가입니다. 함께 즐거운 시간을 보내요!`,
            // Add some random attendees from the group members
            generalAttendees: group.memberIds.slice(0, Math.floor(Math.random() * group.memberIds.length))
        });
    }
});

// Generate a conversation for each group
GROUPS.forEach(group => {
    const groupConversation: Conversation = {
        id: `conv_group_${group.id}`,
        groupId: group.id,
        participantIds: group.memberIds,
        messages: [],
        lastMessageAt: group.createdAt,
        name: group.name,
        creatorId: group.creatorId,
    };
    CONVERSATIONS.push(groupConversation);
});