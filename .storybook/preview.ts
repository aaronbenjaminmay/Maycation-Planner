import '../tokens/generated/tokens.css'
import '../src/index.css'
// App.css is still required by Wave 2/3 components (ScreenHeader, PageControls,
// DashboardCard, DetailHeader, DayTile) and shared utilities (.eyebrow, .muted).
// Wave 1 components (Button, IconButton, CardSurface, FeedbackMessage,
// EmptyState, ModalSheet) are validated self-contained without it.
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
