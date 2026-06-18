import { Component } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
          <section className="max-w-lg rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-glow backdrop-blur">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-amber-300" />
            <h1 className="text-2xl font-bold">Kutilmagan xatolik yuz berdi</h1>
            <p className="mt-3 text-sm text-slate-300">Sahifani yangilang yoki keyinroq qayta urinib ko‘ring.</p>
            <button className="primary-button mt-6" onClick={() => window.location.reload()}>
              <RotateCcw className="h-4 w-4" />
              Qayta yuklash
            </button>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}
