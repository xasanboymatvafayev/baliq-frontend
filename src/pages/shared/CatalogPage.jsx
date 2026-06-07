import { Search } from 'lucide-react'
import { EmptyState } from '../../components/common/EmptyState.jsx'
import { usePageTitle } from '../../hooks/usePageTitle.js'

export function CatalogPage() {
  usePageTitle('Baliqlar katalogi')
  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <h2 className="text-3xl font-black">Baliqlar katalogi</h2>
        <p className="mt-2 text-slate-500">Narx, vazn, ferma va yetkazib berish shartlari bo‘yicha qidiruv.</p>
        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input className="soft-input pl-10" placeholder="Baliq nomi yoki ferma bo‘yicha qidirish" />
          </div>
          <select className="soft-input">
            <option>Viloyat</option>
          </select>
          <select className="soft-input">
            <option>Narx oralig‘i</option>
          </select>
        </div>
      </section>
      <EmptyState title="Katalog bo‘sh" description="Fish API endpointi ulanganida kartalar shu yerda paydo bo‘ladi." />
    </div>
  )
}
