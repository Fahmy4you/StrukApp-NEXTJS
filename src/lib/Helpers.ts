import { SettingsData } from "@/types/Settings";

export const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) {
    return "Selamat Pagi";
  } else if (hour >= 11 && hour < 15) {
    return "Selamat Siang";
  } else if (hour >= 15 && hour < 18) {
    return "Selamat Sore";
  } else {
    return "Selamat Malam";
  }
};

export const formatIDR = (val: any) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('id-ID').format(num);
};

export const getReceiptMetadata = (nominal: number, settings: SettingsData) => {
  // 1. Kalkulasi Biaya Admin
  let calculatedAdmin = settings.adminFee.fixedValue;

  if (settings.adminFee.type === 'range') {
    const matchedRange = settings.adminFee.ranges.find((r) => {
      // Pastikan nominal >= min
      const isAboveMin = nominal >= r.min;
      
      // Jika r.max null, anggap benar (unlimited). 
      // Jika tidak null, cek apakah nominal <= r.max
      const isBelowMax = r.max === null || nominal <= r.max;
      
      return isAboveMin && isBelowMax;
    });

    if (matchedRange) {
      calculatedAdmin = matchedRange.fee;
    }
  } else if (settings.adminFee.type === 'multiplier') {
    // Contoh: tiap kelipatan 10.000 biaya 2.500
    const steps = Math.ceil(nominal / settings.adminFee.multiplier.step);
    calculatedAdmin = steps * settings.adminFee.multiplier.fee;
  }

  // 3. Return Object Gabungan
  return {
    shopName: settings.shopName,
    adminFee: calculatedAdmin,
    reference_set: settings.reference,
    logoPath: settings.logo,
    totalAmount: nominal + calculatedAdmin, // Bonus: Memudahkan hitung total
  };
};

export const normalizeKey = (label?: string): string => {
  if (!label) return "unknown_field"; // Berikan fallback agar tidak null
  return label.toLowerCase().trim().replace(/\s+/g, '_');
};