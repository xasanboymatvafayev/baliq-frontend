import { Paperclip, Search, Send, Smile, Upload } from 'lucide-react'
import { EmptyState } from '../common/EmptyState.jsx'

export function ChatInterface({ chats = [], messages = [] }) {
  return (
    <section className="glass-card grid min-h-[620px] overflow-hidden lg:grid-cols-[340px_1fr]">
      <aside className="border-b border-slate-200 p-4 dark:border-white/10 lg:border-b-0 lg:border-r">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input className="soft-input pl-10" placeholder="Chat qidirish" />
        </div>
        <div className="mt-4 space-y-2">
          {chats.length ? (
            chats.map((chat) => (
              <button key={chat.id} className="w-full rounded-2xl p-3 text-left transition hover:bg-ocean-50 dark:hover:bg-white/5">
                <p className="font-semibold">{chat.name}</p>
                <p className="mt-1 truncate text-sm text-slate-500">{chat.lastMessage}</p>
              </button>
            ))
          ) : (
            <EmptyState title="Chatlar hali yo‘q" description="Real-time Socket.io API ulanganda chatlar shu yerda chiqadi." />
          )}
        </div>
      </aside>
      <main className="flex min-h-[620px] flex-col">
        <header className="border-b border-slate-200 p-5 dark:border-white/10">
          <h3 className="text-lg font-bold">Telegram uslubidagi chat</h3>
          <p className="text-sm text-slate-500">Message panel, file upload va image upload uchun tayyor interfeys</p>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-5 dark:bg-slate-950/40">
          {messages.length ? (
            messages.map((message) => (
              <div key={message.id} className="max-w-xl rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
                {message.text}
              </div>
            ))
          ) : (
            <div className="flex h-full items-center justify-center">
              <EmptyState title="Xabarlar yo‘q" description="Socket.io orqali xabarlar kelishi uchun backend URL sozlanadi." />
            </div>
          )}
        </div>
        <footer className="border-t border-slate-200 p-4 dark:border-white/10">
          <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-white p-2 dark:border-white/10 dark:bg-slate-950">
            <button className="secondary-button px-3 py-2" aria-label="Emoji">
              <Smile className="h-5 w-5" />
            </button>
            <button className="secondary-button px-3 py-2" aria-label="Fayl yuklash">
              <Paperclip className="h-5 w-5" />
            </button>
            <button className="secondary-button px-3 py-2" aria-label="Rasm yuklash">
              <Upload className="h-5 w-5" />
            </button>
            <input className="flex-1 bg-transparent px-3 text-sm outline-none" placeholder="Xabar yozing..." />
            <button className="primary-button px-4 py-2">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </footer>
      </main>
    </section>
  )
}
