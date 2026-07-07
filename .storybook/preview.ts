import '../tokens/generated/tokens.css'
import '../src/index.css'
// All CSS Co-location components (Waves 1-3: Button, IconButton, CardSurface,
// FeedbackMessage, EmptyState, ModalSheet, ScreenHeader, PageControls,
// FormActions, FormGrid, DashboardCard, DetailHeader, DayTile) render
// correctly without App.css — verified individually per component. This
// import remains only for shared typography utilities (.eyebrow, .muted,
// .label) and documented product-context/composition overrides.
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
