'use client';
import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc'; 
import AuthenticationCard from '@/components/cards/AuthenticationCard';
import { signInWithGoogle } from '@/lib/AuthenticationAction';
import { AlertLine } from '@/components/alerts/AlertLine';

const AuthPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  };

  return (
      <AuthenticationCard 
        title="Selamat Datang"
        paragraph="Masukkan detail akun Anda untuk masuk atau daftar untuk menikmati semua fitur kami"
      >
        <div className="px-8 pb-10"> 
          {alert?.message && <AlertLine message={alert.message} type={alert.type} className='mb-3' />}
          <div className="mt-6">
            {/* <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Atau lanjut dengan</span>
              </div>
            </div> */}

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              type="button"
              className="w-full cursor-pointer flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 active:scale-[0.98]">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                ) : (
                  <FcGoogle className="text-xl" />
                )}
                Google
            </button>
          </div>
        </div>
      </AuthenticationCard>
  );
};

export default AuthPage;