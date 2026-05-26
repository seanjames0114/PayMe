import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { organizer_name, payment_methods, items, tax, tip } = body

    if (!organizer_name || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getSupabase()
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        organizer_name,
        payment_methods,
        tax: tax || 0,
        tip: tip || 0,
      })
      .select()
      .single()

    if (sessionError) throw sessionError

    const itemRows = items.map((item: { name: string; price: number }) => ({
      session_id: session.id,
      name: item.name,
      price: item.price,
      quantity: 1,
    }))

    const { error: itemsError } = await supabase.from('items').insert(itemRows)
    if (itemsError) throw itemsError

    return NextResponse.json({ sessionId: session.id })
  } catch (err) {
    console.error('Failed to create session:', err)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
