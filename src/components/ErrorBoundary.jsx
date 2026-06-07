import { Component } from 'react'

// Catches render errors anywhere below it and shows a recoverable fallback
// instead of unmounting the whole app (blank screen).
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-2xl">⚠️</div>
          <p className="text-lg font-bold text-slate-900">문제가 발생했어요 / Something went wrong</p>
          <p className="max-w-xs text-sm text-slate-500">
            화면을 새로고침해 주세요. 데이터는 안전하게 보관됩니다.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white"
          >
            새로고침 / Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
