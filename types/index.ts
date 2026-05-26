export interface Session {
  id: string
  organizer_name: string
  payment_methods: PaymentMethod[]
  subtotal: number | null
  tax: number
  tip: number
  created_at: string
}

export interface Item {
  id: string
  session_id: string
  name: string
  price: number
  quantity: number
}

export interface Participant {
  id: string
  session_id: string
  name: string
  color: string
  is_organizer: boolean
  joined_at: string
}

export interface Selection {
  id: string
  participant_id: string
  item_id: string
}

export interface PaymentMethod {
  type: 'venmo' | 'cashapp' | 'paypal' | 'zelle'
  handle: string
}

export interface ParsedReceipt {
  items: { name: string; price: number }[]
  tax: number
  tip: number
}
