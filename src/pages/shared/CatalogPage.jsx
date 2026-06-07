import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { fishService } from '../../services/api/index.js'
import { useCartStore } from '../../store/cartStore.js'
import { useToastStore } from '../../store/toastStore.js'

export function CatalogPage() {
  usePageTitle('Baliqlar katalogi')
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)
  const pushToast = useToastStore((state) => state.pushToast)
  const [search, setSearch] = useState('')

  const { data = [], isLoading } = useQuery({
    queryKey: ['fish', search],
    queryFn: () => fishService.list({ search }),
  })

  const handleAdd = (fish) => {
    addItem({ id: fish.id, name: fish.name, price: fish.price, unit: fish.unit, quantity: 1, fish_id: fish.id })
    pushToast({ title: `${fish.name} savatchaga qo'shildi`, variant: 'success' })
  }

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <h2 className="text-3xl font-black">Baliqlar katalogi</h2>
        <p className="mt-2 text-slate-500">Narx, vazn va ferma bo'yicha qidiruv.</p>
        <div className="relative mt-5">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input className="soft-input pl-10 w-full" placeholder="Baliq nomi bo'yicha qidirish"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </section>
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => <div key={i} className="glass-card h-48 animate-pulse" />)}
        </div>
      ) : data.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-500">Baliq topilmadi</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((fish) => (
            <div key={fish.id} className="glass-card flex flex-col p-5">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-ocean-600">{fish.category}</p>
                <h3 className="mt-1 text-lg font-bold">{fish.name}</h3>
                <p className="mt-1 text-2xl font-black text-ocean-600">{fish.price?.toLocaleString()} so'm/{fish.unit}</p>
                <p className="mt-1 text-sm text-slate-500">Zaxira: {fish.stock} {fish.unit}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="secondary-button flex-1 text-sm" onClick={() => navigate(`/customer/product/${fish.id}`)}>
                  Batafsil
                </button>
                <button className="primary-button flex-1 text-sm" onClick={() => handleAdd(fish)}
                  disabled={!fish.stock}>
                  Savatga
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
