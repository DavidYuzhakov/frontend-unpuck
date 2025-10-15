'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Suppress hydration warnings from external sources
    if (
      error.message?.includes('Extra attributes from the server') ||
      error.message?.includes('bis_skin_checked') ||
      errorInfo?.componentStack?.includes('bis_skin_checked')
    ) {
      // Reset error state to continue rendering
      this.setState({ hasError: false })
      return
    }
    
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>
    }

    return this.props.children
  }
}


