import '../tokens/generated/tokens.css'
import '../src/index.css'
import '../src/tokens-bridge.css'
import '../src/App.css'

const preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
