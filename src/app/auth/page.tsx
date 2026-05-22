export const dynamic = 'force-dynamic';

import { auth } from '@/auth'; // Impor fungsi auth bawaan kamu
import { redirect } from 'next/navigation';
import AuthenticationCard from '@/components/cards/AuthenticationCard';
import PageAuthClient from '@/components/pages/PageAuthClient';

export default async function AuthPage() {
  // 1. Cek sesi user langsung di tingkat server halaman
  const session = await auth();

  // 2. Jika user terdeteksi sudah login, langsung tendang ke dashboard secara paksa
  if (session?.user) {
    redirect('/dashboard');
  }

  // 3. Jika belum login, baru tampilkan tombol Google Login
  return (
    <AuthenticationCard 
      title="Selamat Datang"
      paragraph="Masuk untuk mulai mengelola, mendesain, dan mencetak struk digital Anda dengan mudah."
    >
      <PageAuthClient />
    </AuthenticationCard>
  );
}