import { Loader } from '@mantine/core'

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fullScreen?: boolean
}

export function LoadingSpinner({ size = 'md', fullScreen = false }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50">
        <Loader size={size} />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      <Loader size={size} />
    </div>
  )
}
