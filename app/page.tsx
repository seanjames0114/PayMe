import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { MySessions } from '@/components/landing/MySessions'
import { NavAuth } from '@/components/auth/NavAuth'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#5ECEB8] flex items-center justify-center">
            <span className="text-white font-black text-sm">P</span>
          </div>
          <span className="font-bold text-[#1E293B]">PayMe</span>
        </div>
        <NavAuth />
      </nav>
      

      <div className="max-w-5xl mx-auto">
        <MySessions />
        <Hero />
        <HowItWorks />
      </div>

      <footer className="text-center py-12 text-sm text-[#94A3B8]">
        Made for tables that want to keep things fair
      </footer>
    </main>
  )
}
