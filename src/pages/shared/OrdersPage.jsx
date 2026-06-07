import { DataTable } from '../../components/common/DataTable.jsx'
import { OrderTimeline } from '../../components/orders/OrderTimeline.jsx'
import { usePageTitle } from '../../hooks/usePageTitle.js'

const columns = [
  { key: 'id', title: 'ID' },
  { key: 'customer', title: 'Mijoz' },
  { key: 'status', title: 'Status' },
  { key: 'total', title: 'Jami' },
]

export function OrdersPage({ title = 'Buyurtmalar' }) {
  usePageTitle(title)
  return (
    <div className="space-y-6">
      <OrderTimeline currentStatus="IN_TRANSIT" />
      <DataTable columns={columns} rows={[]} emptyTitle={`${title} hali yo‘q`} />
    </div>
  )
}
