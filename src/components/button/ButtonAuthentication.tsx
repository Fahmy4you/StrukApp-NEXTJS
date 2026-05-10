import { LucideIcon } from 'lucide-react';  

const ButtonAuthentication = ({ isLoading, Icon, text }: { isLoading: boolean, Icon: LucideIcon, text: string }) => {
  return (
    <button 
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]">
        {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
        <>
            {text}
            <Icon size={18} />
        </>
        )}
    </button>
  )
}

export default ButtonAuthentication
