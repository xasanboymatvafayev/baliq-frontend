import { useT } from '../../store/i18nStore.js'
import { ChatInterface } from '../../components/chat/ChatInterface.jsx'
import { usePageTitle } from '../../hooks/usePageTitle.js'

export function ChatPage({ title = 'Chat', role }) {
  usePageTitle(title)
  return <ChatInterface role={role} />
}
