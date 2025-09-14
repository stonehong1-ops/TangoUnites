export enum SocialPlatform {
  Facebook = 'Facebook',
  Instagram = 'Instagram',
  Band = 'Band',
  Web = 'Web',
  Contact = 'Contact',
  KakaoTalk = 'KakaoTalk',
  DaumCafe = 'DaumCafe',
}

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export enum Gender {
  Tanguero = 'Tanguero', // Male
  Tanguera = 'Tanguera', // Female
}

export enum UserRole {
  Tangueros = 'Tangueros',
  Instructor = 'Instructor',
  Organizer = 'Organizer',
  Admin = 'Admin',
  SystemAdmin = 'SystemAdmin',
  DJ = 'DJ',
  TranslatorEN = 'TranslatorEN',
  TranslatorES = 'TranslatorES',
  ServiceProvider = 'ServiceProvider',
}

export interface User {
  id: string;
  nickname: string;
  nativeNickname: string;
  phoneNumber: string; // number without country code
  countryCode: string; // e.g., '+82'
  isPhonePublic: boolean;
  photoUrl?: string;
  socialLinks: SocialLink[];
  createdAt: string; // ISO String
  gender: Gender;
  roles: UserRole[];
  favoriteRegion?: Region | 'all';
  isOnline?: boolean;
  points?: number;
}

export enum EventType {
  Milonga = '밀롱가',
  Class = '클래스',
  Workshop = '워크샵',
}

export enum Region {
  SeoulHongdae = '서울 홍대',
  SeoulGangnam = '서울 강남',
  Busan = '부산',
  Daegu = '대구',
  Daejeon = '대전',
  Gwangju = '광주',
  Incheon = '인천',
  Suwon = '수원',
  Cheongju = '청주',
  Chuncheon = '춘천',
  Other = '기타',
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  addressEn?: string;
  region: Region;
  creatorId: string;
  imageUrls: string[];
  socialLinks?: SocialLink[];
}

export interface BaseEvent {
  id:string;
  title: string;
  creatorId: string;
  description: string;
  imageUrls?: string[];
  venueId?: string;
  groupId?: string;
  generalAttendees?: string[];
  interestedAttendees?: string[];
}

export interface Milonga extends BaseEvent {
    type: EventType.Milonga;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    posterImageUrl?: string;
    providerIds?: string[];
    seriesId?: string;
    djId?: string;
    hasSignUp?: boolean;
    signUpDescription?: string;
    maxAttendees?: number;
    participants?: string[];
    inquiries?: Comment[];
}

export interface ClassSession {
    date: string; // YYYY-MM-DD
    startTime?: string; // HH:MM
    endTime?: string; // HH:MM
}

export interface Class extends BaseEvent {
    type: EventType.Class;
    sessions: ClassSession[];
    posterImageUrl?: string;
    startTime?: string;
    endTime?: string;
}

export interface Workshop extends BaseEvent {
    type: EventType.Workshop;
    dates: [string, string]; // [startDate, endDate]
    detailsUrl?: string;
    signUpUrl?: string;
    maxAttendees?: number;
}

// For components that can handle any event type
export type AnyEvent = Milonga | Class | Workshop;

export enum Language {
  EN = 'en',
  KO = 'ko',
  CN = 'cn',
  JP = 'jp',
  VN = 'vn',
  DE = 'de',
  FR = 'fr',
  ES = 'es',
  IT = 'it',
  RU = 'ru',
}

export interface BannerItem {
  id: string;
  title: string;
  duration: string;
  organizerName: string; // This is for display only
  imageUrl: string;
  detailsUrl?: string;
  signUpUrl?: string;
}

export enum ServiceCategory {
  Lodging = '숙소',
  Shoes = '슈즈',
  Dress = '드레스',
  HairBeauty = '헤어/뷰티',
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  region: Region;
  hostId: string;
  imageUrls: string[];
  price: string;
  description: string;
  unavailableDates?: string[];
}

export enum ReactionType {
    Like = 'Like',
    Love = 'Love',
    Haha = 'Haha',
    Wow = 'Wow',
    Sad = 'Sad',
    Angry = 'Angry',
}

export interface Reaction {
    userId: string;
    type: ReactionType;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string; // ISO String
  reactions: Reaction[];
  replies: Comment[];
}

export enum PostCategory {
  Tango = 'tango',
  Life = 'life',
  Attitude = 'attitude',
  Video = 'video',
  CarrotMarket = 'carrotMarket',
  Youtube = 'youtube',
  TangoMusic = 'tangoMusic',
}

export interface Post {
  id: string;
  authorId: string;
  title?: string;
  content: string;
  imageUrls?: string[];
  videoUrl?: string;
  linkUrls?: string[];
  createdAt: string; // ISO String
  reactions: Reaction[];
  comments: Comment[];
  groupId?: string;
  isNotice?: boolean;
  taggedUserIds?: string[];
  taggedVenueId?: string;
  category?: PostCategory;
  forSaleStatus?: 'forSale' | 'sold';
  viewCount?: number;
  isPinned?: boolean;
}

export enum NotificationType {
    Like = 'Like',
    Comment = 'Comment',
    ClubRequest = 'ClubRequest',
    GroupRequest = 'GroupRequest',
    GroupRequestApproved = 'GroupRequestApproved',
    MilongaInquiry = 'MilongaInquiry',
}

export interface Notification {
  id: string;
  type: NotificationType;
  fromUserId: string;
  recipientId?: string;
  postId?: string;
  clubId?: string;
  groupId?: string;
  milongaId?: string;
  commentId?: string;
  read: boolean;
  createdAt: string;
  requestStatus?: 'approved' | 'declined';
}

export interface Message {
    id: string;
    senderId: string;
    text?: string;
    imageUrl?: string;
    videoUrl?: string;
    createdAt: string; // ISO String
    read: boolean;
}

export interface Conversation {
    id: string;
    participantIds: string[]; // [user1_id, user2_id]
    messages: Message[];
    lastMessageAt: string; // ISO String
    name?: string; // For group chats
    creatorId?: string; // The user who created the group chat
    groupId?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  clubId?: string; // Optional link to a club
  imageUrls: string[];
  memberIds: string[];
  creatorId: string;
  staffIds?: string[];
  createdAt: string; // ISO String
  requiresApproval: boolean;
  isPublic?: boolean;
  isAnonymous?: boolean;
  isInviteOnly?: boolean;
}

export interface LucyChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text?: string;
  imageUrl?: string;
  isLoading?: boolean;
  appContent?: {
      type: 'event' | 'post' | 'service';
      id: string;
  };
  imageOptions?: { prompt: string; labelKey: string; }[];
  editedImageUrl?: string;
}

export interface LucyConversation {
    id: string;
    title: string;
    messages: LucyChatMessage[];
    lastUpdatedAt: string;
}