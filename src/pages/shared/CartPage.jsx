import { ShoppingBag } from 'lucide-react'
import { EmptyState } from '../../components/common/EmptyState.jsx'
import { useCartStore } from '../../store/cartStore.js'
import { usePageTitle } from '../../hooks/usePageTitle.js'

export function CartPage() {
  usePageTitle('Savatcha')
  const items = useCartStore((state) => state.items)

  return (
    <div className="space-y-6">
      <section className="glass-card flex items-center justify-between p-6">
        <div>
          <h2 className="text-3xl font-black">Savatcha</h2>
          <p className="mt-2 text-slate-500">Buyurtma yaratishdan oldin mahsulotlarni tekshiring.</p>
        </div>
        <ShoppingBag className="h-10 w-10 text-ocean-600" />
      </section>
      {items.length ? <div className="glass-card p-6">Savatcha elementlari</div> : <EmptyState title="Savatcha bo‘sh" />}
    </div>
  )
}
