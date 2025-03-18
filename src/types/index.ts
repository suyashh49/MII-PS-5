// src/types/index.ts
export type RootStackParamList = {
  Welcome: undefined;
  Login_Maid: undefined;
  Profile: undefined;
  Login: undefined;
  Otp: { phone: string }; 
  Home: {
    userName: string;
    email: string;
  };
  Feedback: { bookingId: string };
  MaidProfile: undefined;
  KYCDetailsMaid: {
    name: string;
    gender: string;
    location: string;
    timeAvailable: { [key: string]: string[] };
    cooking: boolean;
    cleaning: boolean;
    pricePerService: string;
  };
  HomeMaid: { name: string; govtId: string | null; imageUrl: string | null };
  BookMaid: undefined; 
  CartCheckout: undefined; 
  
};

export type BookStackParamList = {
  BookMaid: undefined;
  TimeSlotSelection: {
    maid: Maid;
    bookingType: number; // Make sure this is non-nullable; adjust your logic if needed.
    service: 'cooking' | 'cleaning' | 'both';
  };
  Feedback: undefined;
};
  
  export interface User {
    id: string;
    name: string;
    email: string;
    photoUrl?: string;
    token: string;
  }
  
  export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
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
    location: string | null;
    govtId: string | null;
    imageUrl: string | null;
    timeAvailable: TimeAvailability;
    cleaning: boolean | null;
    cooking: boolean | null;
    pricePerService: PricePerService | null;
  }
  
  export interface Booking {
    BookingId: number;
    maidId: number;
    userId: number;
    slot: {
      [key: string]: string;
    };
    service: 'cleaning' | 'cooking' | 'both';
    paymentStatus: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface SlotData {
    [day: string]: string;
  }
  
  export interface SearchRequestData {
    location: string;
    service: string;
    slot: SlotData;
  }
  
  export interface BookRequestData {
    maidId: number;
    slot: SlotData;
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