import { useEffect, useRef, useState, useCallback } from 'react'
import { Paperclip, Search, Send, Smile, X, Image as ImageIcon } from 'lucide-react'
import { EmptyState } from '../common/EmptyState.jsx'
import { useAuthStore } from '../../store/authStore.js'
import { useChatStore } from '../../store/chatStore.js'
import { chatService } from '../../services/api/index.js'
import { getSocket } from '../../services/socketClient.js'
import { fileService } from '../../services/api/index.js'

const QUICK_EMOJIS = ['👍', '❤️', '😊', '🙏', '✅', '📦', '🚚', '🐟']

function Avatar({ name, size = 'sm' }) {
  const initials = (name || '?').split(' ').map((n) => n[0]?.toUpperCase()).slice(0, 2).join('')
  const colors = ['bg-ocean-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500']
  const color = colors[(name || '').charCodeAt(0) % colors.length]
  const sz = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
  return (
    <div className={`${sz} ${color} rounded-2xl flex items-center justify-center font-black text-white shrink-0 shadow-sm`}>
      {initials}
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500"
          style={{ animation: `pulseSoft 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  )
}

function MessageBubble({ msg, isMe, showAvatar }) {
  const time = msg.created_at
    ? new Date(msg.created_at).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isMe && (
        <div className="shrink-0 mb-1">
          {showAvatar ? <Avatar name={msg.sender_name} /> : <div className="w-8" />}
        </div>
      )}

      <div className={`max-w-[72%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isMe && showAvatar && (
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-1">{msg.sender_name}</p>
        )}

        <div
          className={`relative rounded-3xl px-4 py-2.5 shadow-sm text-sm leading-relaxed
            ${isMe
              ? 'bg-gradient-to-br from-ocean-500 to-ocean-600 text-white rounded-br-lg'
              : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-bl-lg'
            }`}
        >
          {msg.file_url && (
            <a
              href={msg.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 text-sm underline mb-1.5 ${isMe ? 'text-ocean-100' : 'text-ocean-600 dark:text-ocean-400'}`}
            >
              <Paperclip className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate max-w-[200px]">Fayl yuklab olish</span>
            </a>
          )}
          {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
        </div>

        <p className={`text-[10px] px-1 text-slate-400 dark:text-slate-500 ${isMe ? 'text-right' : ''}`}>
          {time}
        </p>
      </div>
    </div>
  )
}

export function ChatInterface() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const { activeChatId, setActiveChatId } = useChatStore()

  const [rooms, setRooms] = useState([])
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [showEmoji, setShowEmoji] = useState(false)
  const [uploading, setUploading] = useState(false)

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const socketRef = useRef(null)
  const typingTimeout = useRef(null)

  useEffect(() => {
    const socket = getSocket(token)
    socket.connect()
    socketRef.current = socket

    socket.on('new_message', (msg) => {
      if (msg.room_id === activeChatId) {
        setMessages((prev) => [...prev, msg])
      }
      setRooms((prev) =>
        prev.map((r) =>
          r.id === msg.room_id ? { ...r, lastMessage: msg.text || '📎 Fayl', lastMessageAt: msg.created_at } : r
        )
      )
    })

    socket.on('user_typing', ({ room_id, user_name }) => {
      if (room_id === activeChatId) {
        setTypingUsers((prev) => prev.includes(user_name) ? prev : [...prev, user_name])
        clearTimeout(typingTimeout.current)
        typingTimeout.current = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u !== user_name))
        }, 3000)
      }
    })

    return () => {
      socket.off('new_message')
      socket.off('user_typing')
      socket.disconnect()
    }
  }, [token, activeChatId])

  useEffect(() => {
    setLoading(true)
    chatService.rooms()
      .then((data) => setRooms(data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!activeChatId) return
    setMessages([])
    chatService.messages(activeChatId)
      .then((data) => setMessages(data || []))
      .catch(() => {})
    if (socketRef.current) {
      socketRef.current.emit('join_room', { room_id: activeChatId })
    }
  }, [activeChatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || !activeChatId) return
    setSending(true)
    try {
      await chatService.sendMessage(activeChatId, { text: text.trim(), type: 'text' })
      setText('')
      setShowEmoji(false)
    } catch {}
    finally { setSending(false) }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !activeChatId) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const result = await chatService.upload(formData)
      await chatService.sendMessage(activeChatId, {
        text: `📎 ${file.name}`,
        file_url: result.url,
        type: 'file',
      })
    } catch {}
    finally { setUploading(false); e.target.value = '' }
  }

  const handleTyping = () => {
    if (socketRef.current && activeChatId) {
      socketRef.current.emit('typing', {
        room_id: activeChatId,
        user_name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const filteredRooms = rooms.filter((r) =>
    r.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const activeRoom = rooms.find((r) => r.id === activeChatId)

  return (
    <section className="glass-card grid overflow-hidden lg:grid-cols-[300px_1fr]" style={{ minHeight: '620px', height: 'calc(100vh - 140px)', maxHeight: '820px' }}>
      {/* Sidebar */}
      <aside className={`flex flex-col border-b border-slate-200 dark:border-white/10 lg:border-b-0 lg:border-r ${activeChatId ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 dark:border-white/5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="soft-input pl-10 text-sm"
              placeholder="Chat qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="p-2 space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3 p-3 rounded-2xl">
                  <div className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-white/5 animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-white/5 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRooms.length ? (
            filteredRooms.map((room) => {
              const active = activeChatId === room.id
              return (
                <button
                  key={room.id}
                  className={`w-full flex items-center gap-3 rounded-2xl p-3 text-left transition-all
                    ${active ? 'bg-ocean-50 dark:bg-ocean-900/30 ring-1 ring-ocean-300 dark:ring-ocean-700' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                  onClick={() => setActiveChatId(room.id)}
                >
                  <Avatar name={room.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${active ? 'text-ocean-700 dark:text-ocean-300' : ''}`}>
                      {room.name || 'Chat'}
                    </p>
                    <p className="truncate text-xs text-slate-500 mt-0.5">
                      {room.lastMessage || "Xabar yo'q"}
                    </p>
                  </div>
                </button>
              )
            })
          ) : (
            <div className="p-4">
              <EmptyState title="Chatlar topilmadi" description="Yangi buyurtma yoki ferma yaratilganda chat avtomatik ochiladi." />
            </div>
          )}
        </div>
      </aside>

      {/* Main area */}
      <main className={`flex flex-col min-h-0 ${!activeChatId ? 'hidden lg:flex' : 'flex'}`}>
        {/* Header */}
        <header className="border-b border-slate-200 dark:border-white/10 px-5 py-4 flex items-center gap-3 shrink-0">
          {activeChatId && (
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500"
              onClick={() => setActiveChatId(null)}
            >
              ←
            </button>
          )}
          {activeRoom ? (
            <>
              <Avatar name={activeRoom.name} size="md" />
              <div className="flex-1 min-w-0">
                <h3 className="font-black truncate">{activeRoom.name || 'Chat'}</h3>
                {typingUsers.length > 0 ? (
                  <p className="text-xs text-ocean-500 flex items-center gap-1">
                    <span className="flex gap-0.5">
                      {[0,1,2].map((i) => <span key={i} className="h-1.5 w-1.5 rounded-full bg-ocean-400" style={{ animation: `pulseSoft 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
                    </span>
                    {typingUsers.join(', ')} yozmoqda...
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">{activeRoom.members?.length || 0} ta ishtirokchi</p>
                )}
              </div>
            </>
          ) : (
            <div>
              <h3 className="font-black">Chat</h3>
              <p className="text-xs text-slate-500">Chatni tanlang</p>
            </div>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/60 dark:bg-slate-950/40 min-h-0">
          {!activeChatId ? (
            <div className="h-full flex items-center justify-center">
              <EmptyState title="Chat tanlang" description="Chap paneldan chatni tanlang." />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <EmptyState title="Xabarlar yo'q" description="Birinchi xabarni yuboring!" />
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                const isMe = msg.sender_id === user?.id
                const prevMsg = messages[idx - 1]
                const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id
                return (
                  <MessageBubble key={msg.id || idx} msg={msg} isMe={isMe} showAvatar={showAvatar} />
                )
              })}
              {typingUsers.length > 0 && (
                <div className="flex items-end gap-2">
                  <div className="h-8 w-8 rounded-2xl bg-slate-200 dark:bg-white/10 shrink-0" />
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-3xl rounded-bl-lg shadow-sm">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Footer */}
        {activeChatId && (
          <footer className="border-t border-slate-200 dark:border-white/10 p-4 shrink-0">
            {showEmoji && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    className="text-xl hover:scale-125 transition-transform"
                    onClick={() => { setText((t) => t + emoji); setShowEmoji(false) }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2">
              <button
                className="p-2 rounded-xl text-slate-400 hover:text-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/30 transition"
                onClick={() => setShowEmoji((v) => !v)}
                title="Emoji"
              >
                <Smile className="h-5 w-5" />
              </button>
              <button
                className={`p-2 rounded-xl text-slate-400 hover:text-ocean-500 hover:bg-ocean-50 dark:hover:bg-ocean-900/30 transition ${uploading ? 'opacity-50' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Fayl biriktirish"
              >
                {uploading
                  ? <span className="h-5 w-5 rounded-full border-2 border-slate-300 border-t-ocean-500 animate-spin block" />
                  : <Paperclip className="h-5 w-5" />}
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
              <textarea
                className="flex-1 bg-transparent text-sm outline-none resize-none max-h-32 py-1 leading-relaxed placeholder:text-slate-400"
                placeholder="Xabar yozing..."
                rows={1}
                value={text}
                onChange={(e) => { setText(e.target.value); handleTyping() }}
                onKeyDown={handleKeyDown}
                style={{ fieldSizing: 'content' }}
              />
              <button
                className={`p-2.5 rounded-xl transition-all ${text.trim()
                  ? 'bg-ocean-500 hover:bg-ocean-600 text-white shadow-md shadow-ocean-500/30 hover:scale-105'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed'}`}
                onClick={handleSend}
                disabled={sending || !text.trim()}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </footer>
        )}
      </main>
    </section>
  )
}
