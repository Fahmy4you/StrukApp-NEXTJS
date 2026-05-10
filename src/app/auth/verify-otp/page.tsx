'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, RefreshCcw, ShieldCheck } from 'lucide-react';
import AuthenticationCard from '@/components/cards/AuthenticationCard';
import ButtonAuthentication from '@/components/button/ButtonAuthentication';

// --- Komponen OTP Input ---

const OTPInputGroup = ({ length = 6, onComplete }: { length?: number, onComplete: (code: string) => void }) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    const combinedCode = newOtp.join("");
    if (combinedCode.length === length) {
      onComplete(combinedCode);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const data = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(data)) return;
    const pasteData = data.slice(0, length).split("");
    const newOtp = [...otp];
    pasteData.forEach((char, index) => { newOtp[index] = char; });
    setOtp(newOtp);
    onComplete(pasteData.join(""));
    const lastIdx = Math.min(pasteData.length, length - 1);
    if (inputRefs.current[lastIdx]) inputRefs.current[lastIdx].focus();
  };

  return (
    <div className="flex justify-center gap-2 mb-8" onPaste={handlePaste}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el!; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
        />
      ))}
    </div>
  );
};

// --- Komponen Utama ---

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [timer, setTimer] = useState(59);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length < 6) return;
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <AuthenticationCard 
        title="Verifikasi OTP" 
        paragraph="Masukkan 6 digit kode yang telah kami kirimkan ke email Anda."
        icon={<ShieldCheck className="text-white" size={28} />}
      >
        <div className="px-8 pb-10">
          <form onSubmit={handleSubmit}>
            <OTPInputGroup onComplete={(code) => setOtpValue(code)} />
            
            <div className="space-y-6">
              <ButtonAuthentication 
                isLoading={isLoading} 
                Icon={ArrowRight} 
                text="Verifikasi Kode" 
              />

              <div className="text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tidak menerima kode?
                </p>
                {timer > 0 ? (
                  <p className="text-sm font-semibold text-blue-600 mt-1">
                    Kirim ulang dalam {timer} detik
                  </p>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setTimer(59)}
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline mt-1"
                  >
                    <RefreshCcw size={14} />
                    Kirim Ulang Kode
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </AuthenticationCard>
    </div>
  );
};

export default App;