'use client';

import { useEffect, useState } from 'react';
import { FcGoogle } from 'react-icons/fc'; 
import { signInWithGoogle } from '@/lib/AuthenticationAction';
import { AlertLine } from '@/components/alerts/AlertLine';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function PageAuthClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [session.status]);

  const handleGoogleLogin = async () => {
    console.log(session);
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
    //   setAlert({ message: 'Gagal masuk dengan Google', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-8 pb-10"> 
      {alert?.message && <AlertLine message={alert.message} type={alert.type} className='mb-3' />}
      <div className="mt-6">
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          type="button"
          className="w-full cursor-pointer flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 active:scale-[0.98]"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          ) : (
            <FcGoogle className="text-xl" />
          )}
          Google
        </button>
      </div>
    </div>
  );
}