import { Link, useNavigate } from 'react-router-dom'
import { Fish, Home, ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050a14] flex items-center justify-center p-6">
      <div className="text-center max-w-md w-full">
        <div className="relative inline-block mb-8">
          <div className="text-[120px] leading-none select-none animate-float">🐟</div>
          <div className="absolute -top-2 -right-4 text-5xl font-black text-ocean-600 opacity-20 select-none">?</div>
        </div>

        <div className="glass-card p-8 space-y-5">
          <div>
            <h1 className="text-8xl font-black text-ocean-600 leading-none">404</h1>
            <h2 className="text-2xl font-black mt-3">Sahifa topilmadi</h2>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              Siz qidirgan sahifa mavjud emas yoki ko'chirilgan.
              Balki baliq qochib ketdi? 🎣
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(-1)}
              className="secondary-button flex-1 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Orqaga
            </button>
            <Link to="/" className="primary-button flex-1 gap-2 justify-center">
              <Home className="h-4 w-4" />
              Bosh sahifaga
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Fish className="h-3.5 w-3.5" />
          <span>Baliq Savdosi platformasi</span>
        </div>
      </div>
    </div>
  )
}
