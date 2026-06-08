import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({ currentPage, hasMore, onPageChange, totalPages }) {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <button
        className="secondary-button flex items-center gap-1 px-4 py-2"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        Oldingi
      </button>
      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
        Sahifa {currentPage}
        {totalPages ? ` / ${totalPages}` : ''}
      </span>
      <button
        className="secondary-button flex items-center gap-1 px-4 py-2"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasMore}
      >
        Keyingi
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
