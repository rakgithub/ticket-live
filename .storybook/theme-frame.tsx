import { useEffect, type ReactNode } from 'react'

export function ThemeFrame({ theme, children }: { theme: 'light' | 'dark'; children: ReactNode }) {
  useEffect(() => {
    const previousTheme = document.documentElement.dataset.theme
    document.documentElement.dataset.theme = theme
    return () => {
      if (previousTheme) document.documentElement.dataset.theme = previousTheme
      else delete document.documentElement.dataset.theme
    }
  }, [theme])

  return <div data-theme={theme} className="min-h-svh w-full bg-surface-page p-page-gutter text-text-primary">{children}</div>
}
