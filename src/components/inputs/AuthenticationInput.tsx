import { Eye, EyeOff, Lock, LucideIcon, Mail } from "lucide-react"

const AuthenticationInput = ({placeholder, label, type, Icon = Mail, className}: {placeholder: string, label: string, type: string, Icon: LucideIcon, className?: string}) => {
  return (
    <div className={className}>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">{label}</label>
        <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            {Icon && <Icon size={14} className="text-blue-500" />}
        </div>
        <input 
            type={type} 
            placeholder={placeholder}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white outline-none transition-all"
        />
        </div>
    </div>
  )
}

export const AuthenticationInputPassword = ({placeholder = "••••••••", label, showPassword, setShowPassword, className, showForgotPassword, Icon = Lock}: {placeholder?: string, label: string, showPassword: boolean, setShowPassword: (show: boolean) => void, className?: string, showForgotPassword?: boolean, Icon?: LucideIcon}) => {
    return (
        <div className={className || "space-y-2"}>
            <div className="flex justify-between items-center ml-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
            {showForgotPassword && (
                <a href="#" className="text-xs text-blue-600 hover:underline">Lupa Password?</a>
            )}
            </div>
            <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                {Icon && <Icon size={18} />}
            </div>
            <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder={placeholder}
                className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white outline-none transition-all"
            />
            <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            </div>
        </div>
    )
}

export default AuthenticationInput
