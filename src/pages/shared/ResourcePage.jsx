import { Plus, SlidersHorizontal } from 'lucide-react'
import { DataTable } from '../../components/common/DataTable.jsx'
import { usePageTitle } from '../../hooks/usePageTitle.js'

const columns = [
  { key: 'name', title: 'Nomi' },
  { key: 'status', title: 'Status' },
  { key: 'createdAt', title: 'Sana' },
]

export function ResourcePage({ title, description, actionLabel = 'Yangi qo‘shish' }) {
  usePageTitle(title)

  return (
    <div className="space-y-6">
      <section className="glass-card flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h2 className="text-3xl font-black">{title}</h2>
          <p className="mt-2 text-slate-500">{description}</p>
        </div>
        <div className="flex gap-3">
          <button className="secondary-button">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
          <button className="primary-button">
            <Plus className="h-4 w-4" />
            {actionLabel}
          </button>
        </div>
      </section>
      <DataTable columns={columns} rows={[]} emptyTitle={`${title} uchun ma’lumotlar hali kelmadi`} />
    </div>
  )
}
