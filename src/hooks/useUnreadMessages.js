import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { api } from '../lib/apiClient'

/**
 * A single "do I have any unread conversation" boolean for the Navbar's
 * message-icon dot — not a count, no typing/presence indicators (out of
 * scope for this pass). Unread = a conversation's last_message_at is newer
 * than this viewer's own read cursor on it — computed server-side now
 * (server/routes/conversations.js), this hook just asks and re-asks.
 */
export function useUnreadMessages() {
  const { user } = useAuth()
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    if (!user) {
      setHasUnread(false)
      return
    }
    let active = true

    const refresh = async () => {
      const result = await api.get('/conversations')
      if (!active || !result.ok) return
      setHasUnread(result.data.some((c) => c.unread))
    }
    refresh()

    // Any change to a conversation (a new message bumps last_message_at,
    // opening a thread bumps the reader's own cursor) can flip the unread
    // state. This stays a direct Supabase Realtime subscription — RLS
    // already scopes which rows it can see — purely as a "something
    // changed, go re-ask the API" trigger, not a data source itself.
    const channel = supabase
      .channel('unread-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, refresh)
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [user])

  return hasUnread
}
