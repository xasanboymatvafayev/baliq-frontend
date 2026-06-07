import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ShoppingBag, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useCartStore } from '../../store/cartStore.js'
import { useToastStore } from '../../store/toastStore.js'
import { orderService } from '../../services/api/index.js'

export function CartPage() {
  usePageTitle('Savatcha')
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  const orderMutation = useMutation({
    mutationFn: () => orderService.create({
      items: items.map((i) => ({ fish_id: i.fish_id || i.id, quantity: i.quantity, unit_price: i.price })),
      delivery_address: 'Toshkent',
    }),
    onSuccess: () => {
      clearCart()
      pushToast({ title: 'Buyurtma yaratildi!', variant: 'success' })
      queryClient.invalidateQueries(['orders'])
      navigate('/customer/orders')
    },
    onError: (err) => pushToast({ title: err.message, variant: 'error' }),
  })

  return (
    <div className="space-y-6">
      <section className="glass-card flex items-center justify-between p-6">
        <div>
          <h2 className="text-3xl font-black">Savatcha</h2>
          <p className="mt-2 text-slate-500">{items.length} ta mahsulot</p>
        </div>
        <ShoppingBag className="h-10 w-10 text-ocean-600" />
      </section>

      {items.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-500">Savatcha bo'sh</p>
          <button className="primary-button mt-4" onClick={() => navigate('/customer/fish-catalog')}>
            Katalogga o'tish
          </button>
        </div>
      ) : (
        <>
          <div className="glass-card divide-y divide-slate-100 dark:divide-white/5">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-ocean-600">{item.price?.toLocaleString()} so'm/{item.unit || 'kg'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="secondary-button px-2 py-1 text-sm"
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>-</button>
                  <span className="w-10 text-center font-bold">{item.quantity}</span>
                  <button className="secondary-button px-2 py-1 text-sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <p className="w-32 text-right font-bold">{(item.price * item.quantity).toLocaleString()} so'm</p>
                <button className="text-rose-500 hover:text-rose-600" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="glass-card flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-slate-500">Jami summa</p>
              <p className="text-3xl font-black text-ocean-600">{total.toLocaleString()} so'm</p>
            </div>
            <button className="primary-button text-lg px-8 py-3"
              onClick={() => orderMutation.mutate()} disabled={orderMutation.isPending}>
              {orderMutation.isPending ? 'Yuborilmoqda...' : 'Buyurtma berish'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
