import { ChatInterface } from '../../components/chat/ChatInterface.jsx'
import { usePageTitle } from '../../hooks/usePageTitle.js'

export function ChatPage({ title = 'Chat' }) {
  usePageTitle(title)
  return <ChatInterface />
}
