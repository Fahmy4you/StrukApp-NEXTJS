'use client';
import ButtonAuthentication from "@/components/button/ButtonAuthentication";
import AuthenticationCard from "@/components/cards/AuthenticationCard";
import AuthenticationInput from "@/components/inputs/AuthenticationInput";
import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";

const page = () => {
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulasi loading
        setTimeout(() => setIsLoading(false), 2000);
    };

  return (
    <AuthenticationCard title="Lupa Kata Sandi" paragraph="Masukkan email Anda untuk mengatur ulang kata sandi">
        <div className="px-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-5">

                <AuthenticationInput className="space-y-2" placeholder="john.doe@example.com" label="Email" type="email" Icon={Mail} />

                <ButtonAuthentication 
                    isLoading={isLoading} 
                    Icon={ArrowRight} 
                    text="Kirim Tautan Reset" 
                />  
            
            </form>
        </div>
    </AuthenticationCard>
  )
}

export default page
