type ClassValue = string | boolean | undefined | null | Record<string, boolean>

export function cn(...classes: ClassValue[]): string {
  return classes
    .flatMap(c => {
      if (!c || typeof c === 'boolean') return []
      if (typeof c === 'string') return [c]
      return Object.entries(c).filter(([, v]) => v).map(([k]) => k)
    })
    .join(' ')
}

export const PARTICIPANT_COLORS = [
  '#FFB3BA', // pink
  '#FFDFBA', // peach
  '#FFFFBA', // yellow
  '#BAFFC9', // mint
  '#BAE1FF', // blue
  '#D4B3FF', // purple
  '#FFB3E6', // rose
  '#B3FFF0', // teal
]

export function getParticipantColor(index: number): string {
  return PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length]
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function buildPaymentUrl(
  type: 'venmo' | 'cashapp' | 'paypal' | 'zelle',
  handle: string,
  amount: number,
  note: string
): string | null {
  const encodedNote = encodeURIComponent(note)
  const roundedAmount = amount.toFixed(2)

  switch (type) {
    case 'venmo':
      return `venmo://paycharge?txn=pay&recipients=${handle}&amount=${roundedAmount}&note=${encodedNote}`
    case 'cashapp':
      return `https://cash.app/$${handle}/${roundedAmount}`
    case 'paypal':
      return `https://paypal.me/${handle}/${roundedAmount}`
    case 'zelle':
      return null // Zelle has no deep link
  }
}

export function paymentMethodLabel(type: string): string {
  switch (type) {
    case 'venmo': return 'Venmo'
    case 'cashapp': return 'Cash App'
    case 'paypal': return 'PayPal'
    case 'zelle': return 'Zelle'
    default: return type
  }
}
