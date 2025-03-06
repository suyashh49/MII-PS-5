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
  MaidProfile: undefined;
  KYCDetailsMaid: { name: string; gender: string; location: string };
  HomeMaid: { name: string; govtId: string | null; imageUrl: string | null };
  BookMaid: undefined; // Add this line
  CartCheckout: undefined; // Add this line
};
  
  export interface User {
    id: string;
    name: string;
    email: string;
    photoUrl?: string;
  }
  
  export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
  }