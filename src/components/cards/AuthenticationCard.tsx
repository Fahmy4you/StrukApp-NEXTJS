import { Lock } from "lucide-react";

interface AuthenticationCardsProps {
  title?: string;
  paragraph?: string;
  children: React.ReactNode;
  icon?: React.ReactElement;
}

const AuthenticationCard = ({ children, icon = <Lock className="text-white" size={28} />, title = "Selamat Datang", paragraph = "Silakan masuk ke akun Anda untuk melanjutkan" }: AuthenticationCardsProps) => {
  return (
    <div className="w-full max-w-md z-2 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300 transform">
        
        {/* Header Section */}
        <div className="px-8 pt-10 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-6 shadow-lg shadow-blue-500/30">
            {icon}
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            {title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            {/* 'Daftar sekarang untuk menikmati semua fitur kami */}
            {paragraph}
          </p>
        </div>

        {/* Form Section */}
        {children}
    </div>
  )
}

export default AuthenticationCard
