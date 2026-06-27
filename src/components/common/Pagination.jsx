import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

function PageBtn({ page, active, onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-9 min-w-[36px] px-2 rounded-xl text-sm font-bold transition-all duration-150 flex items-center justify-center
        ${active
          ? 'bg-ocean-600 text-white shadow-md shadow-ocean-500/30'
          : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-ocean-300 hover:text-ocean-600 dark:hover:border-ocean-600/40 dark:hover:text-ocean-400'
        }
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-600`}
    >
      {children ?? page}
    </button>
  )
}

export function Pagination({ currentPage, hasMore, onPageChange, totalPages }) {
  const total = totalPages || (hasMore ? currentPage + 1 : currentPage)

  const getPages = () => {
    if (!totalPages) {
      const pages = []
      if (currentPage > 2) pages.push(1)
      if (currentPage > 3) pages.push('...')
      if (currentPage > 1) pages.push(currentPage - 1)
      pages.push(currentPage)
      if (hasMore) pages.push(currentPage + 1)
      return pages
    }

    const delta = 1
    const pages = []
    const left = currentPage - delta
    const right = currentPage + delta

    if (left > 2) pages.push(1, '...')
    else for (let i = 1; i < left; i++) pages.push(i)

    for (let i = Math.max(1, left); i <= Math.min(total, right); i++) pages.push(i)

    if (right < total - 1) pages.push('...', total)
    else for (let i = right + 1; i <= total; i++) pages.push(i)

    return pages
  }

  const pages = getPages()

  return (
    <div className="flex items-center justify-center gap-1.5 py-4 flex-wrap">
      <PageBtn
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </PageBtn>

      {pages.map((p, i) =>
        p === '...'
          ? <span key={`dots-${i}`} className="px-1 text-slate-400"><MoreHorizontal className="h-4 w-4" /></span>
          : <PageBtn key={p} page={p} active={p === currentPage} onClick={() => onPageChange(p)}>{p}</PageBtn>
      )}

      <PageBtn
        disabled={!hasMore && currentPage >= (totalPages || currentPage)}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </PageBtn>

      <span className="text-xs text-slate-400 font-medium ml-2">
        {currentPage}{totalPages ? ` / ${totalPages}` : ''}-sahifa
      </span>
    </div>
  )
}
