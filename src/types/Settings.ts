// Interfaces untuk Type Safety
export interface AdminRange {
  id: string;
  min: number;
  max: number | null; // null berarti "ke atas"
  fee: number;
}

export interface SettingsData {
  shopName: string;
  logo: string | null;
  adminFee: {
    type: 'fixed' | 'range' | 'multiplier';
    fixedValue: number;
    ranges: AdminRange[];
    multiplier: {
      step: number;
      fee: number;
    };
  };
  reference: {
    type: 'full' | 'limited';
    digitLimit: number;
  };
}