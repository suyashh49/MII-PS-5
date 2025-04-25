// src/types/index.ts
export type RootStackParamList = {
  Welcome: undefined;
  Login_Maid: undefined;
  Profile: undefined;
  Login: undefined;
  Otp: { phone: string }; 
  // Home: {
  //   userName: string;
  //   email: string;
  // };
  Home: {
    showBookings?: boolean;
    showActivity?: boolean;
    recentActivity?: string;
  };
  Feedback: { bookingId: number, rating: number };
  MaidProfile: undefined;
  KYCDetailsMaid: {
    name: string;
    gender: string;
    coordinates: { latitude: number; longitude: number } | null;
    location: string;
    timeAvailable: { [key: string]: string[] };
    cooking: boolean;
    cleaning: boolean;
    pricePerService: string;
  };
  HomeMaid: { name: string; govtId: string | null; imageUrl: string | null };
  BookMaid: undefined; 
  CartCheckout: {
    bookingId: number;
  maidId: number;
  service: 'cooking' | 'cleaning' | 'both';
  slot: string;
  type: number;
  pricePerService: number;
  name: string;
  isNewBooking: boolean;
  contactNumber: string;
  } ;
  
  UserProfile: {
    token: string;
    email: string;
    name: string;
    photoUrl: string;
  };
  
};

export type HomeStackParamList = {
  Home: {
    userName: string;
    email: string;
    showBookings?: boolean;
    showActivity?: boolean;
    recentActivity?: string;
  };
  Feedback: {
    bookingId: number;
  };
};

export type BookStackParamList = {
  BookMaid: { preserveState?: boolean } | undefined;
  TimeSlotSelection: {
    maid: Maid;
    bookingType: number; 
    service: 'cooking' | 'cleaning' | 'both';
    pricePerService: number;
    name: string;
    contactNumber: string;
    softBookedSlots?: {
      [day: string]: string;
    }[];

  };
  Feedback: undefined;
  CartCheckout: { bookingId: any; maidId: number; service: "cooking" | "cleaning" | "both"; slot: string; type: number; pricePerService: number; name: string; isNewBooking: boolean; };
};
  
export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  token: string;
  contact : string;
  address : string;
  gender : string
};

  export interface UserProfile {
    token: string;
    email: string;
    name: string;
    photoUrl: string;
  };
  
  export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    isProfileCreated: boolean;
    setProfileCreated: (value: boolean) => void;
  }

  export interface UserBooking {
    id: string;
    photoUrl?: string;
    token: string;
  }
  
  export interface TimeAvailability {
    [day: string]: string[];
  }
  
  export interface PricePerService {
    cleaning?: number;
    cooking?: number;
  }
  
  export interface Maid {
    maidId: number;
    name: string | null;
    contact: string;
    profileCreated: boolean;
    gender: 'Male' | 'Female' | null;
    govtId: string | null;
    imageUrl: string | null;
    timeAvailable: TimeAvailability;
    cleaning: boolean | null;
    cooking: boolean | null;
    pricePerService: PricePerService | null;
    location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  }
  
  export interface Booking {
    BookingId: number;
    maidId: number;
    userId: number;
    maidName: string;
    maidContact: string;
    feedback?: number;
    slot: {
      [key: string]: string;
    };
    service: 'cleaning' | 'cooking' | 'both';
    paymentStatus: boolean;
    createdAt: string;
    updatedAt: string;
    cost: number;
    type: number;
    userName: string;
    userContact: string;
    userLocation: string;
  }
  
  export interface SlotData {
    [day: string]: string;
  }
  
  export interface SearchRequestData {
    location: string;
      latitude?: number;
      longitude?: number;
    service: string;
    slot: SlotData;
  }
  
  export interface BookRequestData {
    maidId: number;
    slot: SlotData;
    type: number;
    service: 'cooking' | 'cleaning' | 'both';
  }
  
  export interface BookingConfirmRequestData {
    bookingId: number;
  }
  
  // Define auth hook interface
  export interface AuthHook {
    user: User | null;
    logout: () => Promise<void>;
  }

  export interface ErrorResponse {
    message?: string;
  }