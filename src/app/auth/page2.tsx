'use client';
import React, { useState } from 'react';
import { Mail, User, ArrowRight } from 'lucide-react';
import AuthenticationInput from '@/components/inputs/AuthenticationInput';
import AuthenticationCard from '@/components/cards/AuthenticationCard';
import { AuthenticationInputPassword } from '@/components/inputs/AuthenticationInput';
import ButtonAuthentication from '@/components/button/ButtonAuthentication';

const App: React.FC = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulasi loading
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
      <AuthenticationCard title={isLogin ? "Selamat Datang" : "Bergabung Dengan Kami"} paragraph={isLogin ? "Masukkan detail akun Anda untuk masuk" : "Daftar sekarang untuk menikmati semua fitur kami"}>
        <div className="px-8 pb-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {!isLogin && (
              <AuthenticationInput className="space-y-2" placeholder="John Doe" label="Nama Lengkap" type="text" Icon={User} />
            )}

            <AuthenticationInput className="space-y-2" placeholder="john.doe@example.com" label="Email" type="email" Icon={Mail} />

            <AuthenticationInputPassword 
              placeholder="••••••••" 
              label="Kata Sandi" 
              showPassword={showPassword} 
              setShowPassword={setShowPassword} 
              showForgotPassword={isLogin}
            />

            {!isLogin && (
              <AuthenticationInputPassword 
                placeholder="••••••••" 
                label="Konfirmasi Kata Sandi" 
                showPassword={showPassword} 
                setShowPassword={setShowPassword} 
                showForgotPassword={false}
              />
            )}

            <ButtonAuthentication 
              isLoading={isLoading} 
              Icon={ArrowRight} 
              text={isLogin ? 'Masuk' : 'Daftar Sekarang'} 
            />  
            
          </form>

          {/* Toggle Login/Register */}
          <p className="text-center text-slate-600 dark:text-slate-400 text-sm mt-4 md:mt-3">
            {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setShowPassword(false);
              }}
              className="ml-2 text-blue-600 font-bold hover:underline cursor-pointer"
            >
              {isLogin ? 'Daftar Sekarang' : 'Masuk'}
            </button>
          </p>
        </div>
      </AuthenticationCard>
  );
};

export default App;