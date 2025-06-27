'use client'

import { Component, ReactNode } from 'react'
import { Button, Title, Text, Container } from '@mantine/core'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Title order={1} className="text-4xl mb-4">
              Oops! Something went wrong
            </Title>
            <Text size="lg" color="dimmed" className="mb-8">
              We're sorry for the inconvenience. Please try refreshing the page.
            </Text>
            <Button
              size="lg"
              onClick={() => {
                this.setState({ hasError: false })
                window.location.reload()
              }}
            >
              Refresh Page
            </Button>
          </div>
        </Container>
      )
    }

    return this.props.children
  }
}
