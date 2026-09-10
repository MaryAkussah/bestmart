import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

/**
 * A single "do I have any unread conversation" boolean for the Navbar's
 * message-icon dot — not a count, no typing/presence indicators (out of
 * scope for this pass). Unread = a conversation's last_message_at is newer
 * than this viewer's own read cursor on it (see conversations table).
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
      const { data } = await supabase
        .from('conversations')
        .select('buyer_id, seller_id, last_message_at, buyer_last_read_at, seller_last_read_at')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      if (!active) return
      const unread = (data ?? []).some((r) => {
        const isBuyer = r.buyer_id === user.id
        const myReadAt = isBuyer ? r.buyer_last_read_at : r.seller_last_read_at
        return new Date(r.last_message_at) > new Date(myReadAt)
      })
      setHasUnread(unread)
    }
    refresh()

    // Any change to a conversation (a new message bumps last_message_at,
    // opening a thread bumps the reader's own cursor) can flip the unread
    // state — RLS already scopes which rows this subscription can see, so
    // a plain refetch on any event is simple and correct.
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
