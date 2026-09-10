import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HiOutlineChatBubbleLeftRight, HiOutlinePaperAirplane, HiOutlineArrowLeft } from 'react-icons/hi2'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function formatListTime(iso) {
  const date = new Date(iso)
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  return sameDay
    ? formatTime(iso)
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// conversations row -> the shape the list and thread views work with, from
// this viewer's point of view. nameMap comes from the
// get_conversation_partner_names RPC (see 006_conversation_partner_names.sql)
// — profiles are private by RLS, so the other participant's name/business_name
// can't come from a plain embedded join.
function shapeConversation(row, userId, nameMap, preview) {
  const isBuyer = row.buyer_id === userId
  const otherId = isBuyer ? row.seller_id : row.buyer_id
  const otherProfile = nameMap?.[otherId]
  const otherName = isBuyer
    ? otherProfile?.business_name || otherProfile?.name || 'Seller'
    : otherProfile?.name || 'Buyer'
  const myReadAt = isBuyer ? row.buyer_last_read_at : row.seller_last_read_at
  return {
    id: row.id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    otherId,
    isBuyer,
    otherName,
    lastMessageAt: row.last_message_at,
    unread: new Date(row.last_message_at) > new Date(myReadAt),
    preview: preview || '',
  }
}

/**
 * Real-time chat between a buyer and a seller, one thread per pair
 * (not per product). Reached either directly (/messages) or via a
 * product's "Message" button, which passes ?seller=&productId=&productName=
 * to find-or-create that thread and open it with the product pre-attached
 * to the next message sent.
 */
function Messages() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [conversations, setConversations] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [messages, setMessages] = useState([])
  const [threadLoading, setThreadLoading] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [pendingProduct, setPendingProduct] = useState(null)
  const [mobileView, setMobileView] = useState('list') // 'list' | 'thread'

  const selectedConvRef = useRef(null)
  const deepLinkHandledRef = useRef(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    selectedConvRef.current = conversations.find((c) => c.id === selectedId) || null
  }, [selectedId, conversations])

  const loadConversations = async () => {
    const { data: rows } = await supabase
      .from('conversations')
      .select('id, buyer_id, seller_id, last_message_at, buyer_last_read_at, seller_last_read_at')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })

    const otherIds = [...new Set((rows ?? []).map((r) => (r.buyer_id === user.id ? r.seller_id : r.buyer_id)))]
    const nameMap = {}
    if (otherIds.length > 0) {
      const { data: nameRows } = await supabase.rpc('get_conversation_partner_names', { profile_ids: otherIds })
      for (const n of nameRows ?? []) {
        nameMap[n.id] = { name: n.name, business_name: n.business_name }
      }
    }

    const ids = (rows ?? []).map((r) => r.id)
    const previews = {}
    if (ids.length > 0) {
      const { data: msgRows } = await supabase
        .from('messages')
        .select('conversation_id, body, created_at')
        .in('conversation_id', ids)
        .order('created_at', { ascending: false })
      for (const m of msgRows ?? []) {
        if (!previews[m.conversation_id]) previews[m.conversation_id] = m.body
      }
    }

    const shaped = (rows ?? []).map((r) => shapeConversation(r, user.id, nameMap, previews[r.id]))
    setConversations(shaped)
    setListLoading(false)
    return shaped
  }

  useEffect(() => {
    if (!user) return
    loadConversations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // "Message Seller" deep link: find or create the thread with that seller,
  // attach the product context to the next message, then open it.
  useEffect(() => {
    const sellerId = searchParams.get('seller')
    if (!user || !sellerId || listLoading || deepLinkHandledRef.current) return
    deepLinkHandledRef.current = true

    const productId = searchParams.get('productId')
    const productName = searchParams.get('productName')
    if (productId && productName) {
      setPendingProduct({ id: Number(productId), name: productName })
    }

    ;(async () => {
      let existing = conversations.find((c) => c.sellerId === sellerId && c.isBuyer)
      if (!existing) {
        const { data, error } = await supabase
          .from('conversations')
          .upsert({ buyer_id: user.id, seller_id: sellerId }, { onConflict: 'buyer_id,seller_id' })
          .select('id')
          .single()
        if (!error && data) {
          const refreshed = await loadConversations()
          existing = refreshed.find((c) => c.id === data.id)
        }
      }
      if (existing) openConversation(existing)
      setSearchParams({}, { replace: true })
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, listLoading, searchParams])

  const markRead = async (conv) => {
    if (!conv || !conv.unread) return
    const column = conv.isBuyer ? 'buyer_last_read_at' : 'seller_last_read_at'
    const now = new Date().toISOString()
    await supabase.from('conversations').update({ [column]: now }).eq('id', conv.id)
    setConversations((prev) => prev.map((c) => (c.id === conv.id ? { ...c, unread: false } : c)))
  }

  const openConversation = async (conv) => {
    setSelectedId(conv.id)
    setMobileView('thread')
    setThreadLoading(true)
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true })
    setMessages(data ?? [])
    setThreadLoading(false)
    markRead(conv)
  }

  // Live updates for the open thread.
  useEffect(() => {
    if (!selectedId) return

    const channel = supabase
      .channel(`messages:${selectedId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedId}` },
        (payload) => {
          setMessages((prev) => (prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]))
          if (payload.new.sender_id !== user.id) {
            markRead(selectedConvRef.current)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    const body = draft.trim()
    if (!body || !selectedId || sending) return

    setSending(true)
    const payload = {
      conversation_id: selectedId,
      sender_id: user.id,
      body,
      ...(pendingProduct ? { product_id: pendingProduct.id, product_name: pendingProduct.name } : {}),
    }
    const { error } = await supabase.from('messages').insert(payload)
    if (!error) {
      setDraft('')
      setPendingProduct(null)
      const conv = selectedConvRef.current
      const column = conv?.isBuyer ? 'buyer_last_read_at' : 'seller_last_read_at'
      const now = new Date().toISOString()
      await supabase.from('conversations').update({ last_message_at: now, [column]: now }).eq('id', selectedId)
      setConversations((prev) =>
        prev
          .map((c) => (c.id === selectedId ? { ...c, lastMessageAt: now, preview: body } : c))
          .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      )
    }
    setSending(false)
  }

  const selectedConv = conversations.find((c) => c.id === selectedId)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden grid md:grid-cols-[280px_1fr] h-[70vh] min-h-[420px]">
        {/* Conversation list */}
        <div className={`border-r border-gray-100 overflow-y-auto ${mobileView === 'thread' ? 'hidden md:block' : ''}`}>
          {listLoading ? null : conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              <HiOutlineChatBubbleLeftRight className="mx-auto text-gray-300 mb-2" size={32} />
              No conversations yet. Message a seller from a product to start one.
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => openConversation(conv)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${
                  selectedId === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm truncate ${conv.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                    {conv.otherName}
                  </p>
                  <span className="text-[11px] text-gray-400 shrink-0">{formatListTime(conv.lastMessageAt)}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {conv.unread && <span className="w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0" />}
                  <p className="text-xs text-gray-500 truncate">{conv.preview}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Thread */}
        <div className={`flex flex-col min-w-0 ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
              Select a conversation
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
                <button
                  onClick={() => setMobileView('list')}
                  className="md:hidden text-gray-500 hover:text-gray-700"
                  aria-label="Back to conversations"
                >
                  <HiOutlineArrowLeft size={18} />
                </button>
                <p className="font-semibold text-gray-900 text-sm">{selectedConv.otherName}</p>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {threadLoading ? null : (
                  <>
                    {messages.map((m) => {
                      const mine = m.sender_id === user.id
                      return (
                        <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${mine ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-900'}`}>
                            {m.product_name && (
                              <p className={`text-[11px] mb-1 ${mine ? 'text-blue-100' : 'text-gray-500'}`}>
                                Re: {m.product_name}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                            <p className={`text-[10px] mt-1 text-right ${mine ? 'text-blue-100' : 'text-gray-400'}`}>
                              {formatTime(m.created_at)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <form onSubmit={handleSend} className="border-t border-gray-100 p-3 shrink-0">
                {pendingProduct && (
                  <div className="mb-2 flex items-center justify-between text-xs bg-blue-50 text-brand-blue rounded-lg px-3 py-1.5">
                    <span>Re: {pendingProduct.name}</span>
                    <button type="button" onClick={() => setPendingProduct(null)} className="text-brand-blue/70 hover:text-brand-blue">
                      ✕
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message..."
                    maxLength={2000}
                    className="flex-1 px-4 py-2.5 rounded-full border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    aria-label="Send message"
                    className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 text-white transition"
                  >
                    <HiOutlinePaperAirplane size={16} />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages
