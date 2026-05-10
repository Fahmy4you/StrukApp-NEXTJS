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
      <AuthenticationCard title="Ubah Kata Sandi" paragraph="Masukkan detail akun Anda untuk mengubah kata sandi"   >
        <div className="px-8 pb-10">
          <form onSubmit={handleSubmit} className="space-y-5">

            <AuthenticationInputPassword 
              placeholder="••••••••" 
              label="Kata Sandi" 
              showPassword={showPassword} 
              setShowPassword={setShowPassword} 
              showForgotPassword={isLogin}
            />
            <AuthenticationInputPassword 
            placeholder="••••••••" 
            label="Konfirmasi Kata Sandi" 
            showPassword={showPassword} 
            setShowPassword={setShowPassword} 
            showForgotPassword={false}
            />

            <ButtonAuthentication 
              isLoading={isLoading} 
              Icon={ArrowRight} 
              text="Ubah Kata Sandi"
            />  
            
          </form>
        </div>
      </AuthenticationCard>
  );
};

export default App;