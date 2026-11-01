import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by RetailVision ErrorBoundary:', error, errorInfo)
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl select-none">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-red-500/30 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {this.props.fallbackTitle || 'A rendering error occurred'}
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              {this.state.error?.message || 'An unexpected runtime error was caught safely.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-blue-500/20"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resume Simulation</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
