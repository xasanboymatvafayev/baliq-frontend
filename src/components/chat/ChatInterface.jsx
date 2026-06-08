import { useEffect, useRef, useState, useCallback } from 'react'
import { Paperclip, Search, Send, Smile, Upload, X } from 'lucide-react'
import { EmptyState } from '../common/EmptyState.jsx'
import { useAuthStore } from '../../store/authStore.js'
import { useChatStore } from '../../store/chatStore.js'
import { chatService } from '../../services/api/index.js'
import { getSocket } from '../../services/socketClient.js'
import { fileService } from '../../services/api/index.js'

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

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const socketRef = useRef(null)

  // Socket.io ulanishi
  useEffect(() => {
    const socket = getSocket(token)
    socket.connect()
    socketRef.current = socket

    socket.on('new_message', (msg) => {
      if (msg.room_id === activeChatId) {
        setMessages((prev) => [...prev, msg])
      }
      // Room last message yangilash
      setRooms((prev) =>
        prev.map((r) =>
          r.id === msg.room_id ? { ...r, lastMessage: msg.text || '📎 Fayl', lastMessageAt: msg.created_at } : r
        )
      )
    })

    socket.on('user_typing', ({ room_id, user_name }) => {
      if (room_id === activeChatId) {
        setTypingUsers((prev) => {
          if (prev.includes(user_name)) return prev
          return [...prev, user_name]
        })
        setTimeout(() => {
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

  // Roomlarni yuklash
  useEffect(() => {
    setLoading(true)
    chatService.rooms()
      .then((data) => setRooms(data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Room tanlanganda xabarlarni yuklash
  useEffect(() => {
    if (!activeChatId) return
    setMessages([])
    chatService.messages(activeChatId)
      .then((data) => setMessages(data || []))
      .catch(() => {})

    // Socket room'ga qo'shilish
    if (socketRef.current) {
      socketRef.current.emit('join_room', { room_id: activeChatId })
    }
  }, [activeChatId])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Xabar yuborish
  const handleSend = async () => {
    if (!text.trim() || !activeChatId) return
    setSending(true)
    try {
      await chatService.sendMessage(activeChatId, { text: text.trim(), type: 'text' })
      setText('')
    } catch (err) {
      console.error('Xabar yuborishda xatolik:', err)
    } finally {
      setSending(false)
    }
  }

  // Fayl yuklash
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !activeChatId) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const result = await chatService.upload(formData)
      await chatService.sendMessage(activeChatId, {
        text: `📎 ${file.name}`,
        file_url: result.url,
        type: 'file',
      })
    } catch (err) {
      console.error('Fayl yuklashda xatolik:', err)
    }
    e.target.value = ''
  }

  // Typing indicator
  const handleTyping = () => {
    if (socketRef.current && activeChatId) {
      socketRef.current.emit('typing', {
        room_id: activeChatId,
        user_name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      })
    }
  }

  // Enter bilan yuborish
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Room filter
  const filteredRooms = rooms.filter((r) =>
    r.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeRoom = rooms.find((r) => r.id === activeChatId)

  return (
    <section className="glass-card grid min-h-[620px] overflow-hidden lg:grid-cols-[340px_1fr]">
      {/* Sidebar - Roomlar */}
      <aside className="border-b border-slate-200 p-4 dark:border-white/10 lg:border-b-0 lg:border-r">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            className="soft-input pl-10"
            placeholder="Chat qidirish"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="mt-4 space-y-2 max-h-[520px] overflow-y-auto">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : filteredRooms.length ? (
            filteredRooms.map((room) => (
              <button
                key={room.id}
                className={`w-full rounded-2xl p-3 text-left transition hover:bg-ocean-50 dark:hover:bg-white/5 ${
                  activeChatId === room.id ? 'bg-ocean-50 dark:bg-white/10 ring-2 ring-ocean-300' : ''
                }`}
                onClick={() => setActiveChatId(room.id)}
              >
                <p className="font-semibold">{room.name || 'Chat'}</p>
                <p className="mt-1 truncate text-sm text-slate-500">
                  {room.lastMessage || "Xabar yo'q"}
                </p>
              </button>
            ))
          ) : (
            <EmptyState title="Chatlar topilmadi" description="Yangi buyurtma yoki ferma yaratilganda chat avtomatik ochiladi." />
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex min-h-[620px] flex-col">
        {/* Header */}
        <header className="border-b border-slate-200 p-5 dark:border-white/10">
          {activeRoom ? (
            <div>
              <h3 className="text-lg font-bold">{activeRoom.name || 'Chat'}</h3>
              {typingUsers.length > 0 && (
                <p className="text-sm text-ocean-500 animate-pulse">
                  {typingUsers.join(', ')} yozmoqda...
                </p>
              )}
              {typingUsers.length === 0 && (
                <p className="text-sm text-slate-500">
                  {activeRoom.members?.length || 0} ta ishtirokchi
                </p>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-bold">Chat</h3>
              <p className="text-sm text-slate-500">Chatni tanlang</p>
            </div>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-5 dark:bg-slate-950/40">
          {!activeChatId ? (
            <div className="flex h-full items-center justify-center">
              <EmptyState title="Chat tanlang" description="Chap paneldan chatni tanlang." />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <EmptyState title="Xabarlar yo'q" description="Birinchi xabarni yuboring!" />
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isMe = msg.sender_id === user?.id
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-3xl p-4 shadow-sm ${
                        isMe
                          ? 'bg-ocean-500 text-white'
                          : 'bg-white dark:bg-slate-900'
                      }`}
                    >
                      {!isMe && (
                        <p className="text-xs font-bold text-ocean-600 dark:text-ocean-400 mb-1">
                          {msg.sender_name}
                        </p>
                      )}
                      {msg.file_url && (
                        <a
                          href={msg.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block text-sm underline mb-1 ${isMe ? 'text-ocean-100' : 'text-ocean-600'}`}
                        >
                          📎 Fayl yuklab olish
                        </a>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-ocean-200' : 'text-slate-400'}`}>
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Footer - message input */}
        {activeChatId && (
          <footer className="border-t border-slate-200 p-4 dark:border-white/10">
            <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-white p-2 dark:border-white/10 dark:bg-slate-950">
              <button
                className="secondary-button px-3 py-2"
                aria-label="Fayl yuklash"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <input
                className="flex-1 bg-transparent px-3 text-sm outline-none"
                placeholder="Xabar yozing..."
                value={text}
                onChange={(e) => { setText(e.target.value); handleTyping() }}
                onKeyDown={handleKeyDown}
              />
              <button
                className="primary-button px-4 py-2"
                onClick={handleSend}
                disabled={sending || !text.trim()}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </footer>
        )}
      </main>
    </section>
  )
}
