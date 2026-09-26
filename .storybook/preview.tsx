import type { Decorator, Preview } from '@storybook/react-vite'
import '../src/design-system/index.css'
import { ThemeFrame } from './theme-frame'

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme === 'dark' ? 'dark' : 'light'
  return <ThemeFrame theme={theme}><Story /></ThemeFrame>
}

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Semantic color theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    a11y: { test: 'error' },
  },
}

export default preview
