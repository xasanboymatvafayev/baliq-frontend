import { EmptyState } from './EmptyState.jsx'

export function DataTable({ columns, rows = [], emptyTitle }) {
  if (!rows.length) {
    return <EmptyState title={emptyTitle} />
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-white/10">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-white/5">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-4 font-bold">
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-ocean-50/40 dark:hover:bg-white/5">
                {columns.map((column) => (
                  <td key={column.key} className="px-5 py-4">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
