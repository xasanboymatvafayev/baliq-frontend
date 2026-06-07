import { ShoppingCart } from 'lucide-react'
import { OrderTimeline } from '../../components/orders/OrderTimeline.jsx'
import { usePageTitle } from '../../hooks/usePageTitle.js'

export function ProductDetailPage() {
  usePageTitle('Mahsulot tafsiloti')
  return (
    <div className="space-y-6">
      <section className="glass-card grid gap-6 p-6 lg:grid-cols-[420px_1fr]">
        <div className="flex min-h-80 items-center justify-center rounded-3xl bg-gradient-to-br from-ocean-100 to-emerald-100 dark:from-ocean-900/40 dark:to-emerald-900/20">
          <span className="text-8xl">🐟</span>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-ocean-600">Product detail</p>
          <h2 className="mt-3 text-4xl font-black">Baliq mahsuloti tafsiloti</h2>
          <p className="mt-4 text-slate-500">
            Backend hali mavjud emasligi sababli mahsulot ma’lumotlari API endpoint orqali kelishga tayyor holatda qoldirildi.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-100 p-4 dark:bg-white/5">
              <p className="text-xs text-slate-500">Narx</p>
              <p className="font-bold">—</p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4 dark:bg-white/5">
              <p className="text-xs text-slate-500">Vazn</p>
              <p className="font-bold">—</p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4 dark:bg-white/5">
              <p className="text-xs text-slate-500">Ferma</p>
              <p className="font-bold">—</p>
            </div>
          </div>
          <button className="primary-button mt-6">
            <ShoppingCart className="h-4 w-4" />
            Savatchaga qo‘shish
          </button>
        </div>
      </section>
      <OrderTimeline currentStatus="PENDING" />
    </div>
  )
}
