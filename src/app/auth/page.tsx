export const dynamic = 'force-dynamic';

import AuthenticationCard from '@/components/cards/AuthenticationCard';
import PageAuthClient from '@/components/pages/PageAuthClient';

export default function AuthPage() {
  return (
    <AuthenticationCard 
      title="Selamat Datang"
      paragraph="Masukkan detail akun Anda untuk masuk atau daftar untuk menikmati semua fitur kami"
    >
      {/* Pindahkan bagian interaktif ke dalam komponen client */}
      <PageAuthClient />
    </AuthenticationCard>
  );
}