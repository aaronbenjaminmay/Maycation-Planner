import { useState } from 'react'
import type { Meta } from '@storybook/react'
import { PlaceInput } from '../components/ui/PlaceInput'
import type { PlaceSuggestion, PlaceValue } from '../lib/places'

const meta = {
  title: 'Components/Forms/PlaceInput',
  component: PlaceInput,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof PlaceInput>

export default meta

const wrap = (children: React.ReactNode) => (
  <div style={{ width: 320 }}>{children}</div>
)

const mockSuggestions: PlaceSuggestion[] = [
  {
    id: 'poi.1',
    name: 'Magic Kingdom',
    address: 'Magic Kingdom Park, Orlando, Florida 32830, United States',
    coordinates: { lat: 28.4177, lng: -81.5812 },
  },
  {
    id: 'poi.2',
    name: 'EPCOT',
    address: 'EPCOT, Bay Lake, Florida 32830, United States',
    coordinates: { lat: 28.3747, lng: -81.5494 },
  },
  {
    id: 'poi.3',
    name: "Disney's Hollywood Studios",
    address: "Disney's Hollywood Studios, Bay Lake, Florida 32830, United States",
    coordinates: { lat: 28.3575, lng: -81.5583 },
  },
]

const resolvedPlace: PlaceValue = {
  name: 'Magic Kingdom',
  address: 'Magic Kingdom Park, Orlando, Florida 32830, United States',
  coordinates: { lat: 28.4177, lng: -81.5812 },
}

const manualPlace: PlaceValue = {
  name: 'My hotel (downtown area)',
  address: '',
  coordinates: undefined,
}

// Stateful wrapper so interactions (select, clear) are visible in Storybook
function PlaceInputDemo(
  props: Omit<React.ComponentProps<typeof PlaceInput>, 'onChange'>,
) {
  const [value, setValue] = useState<PlaceValue | null>(props.value)
  return <PlaceInput {...props} value={value} onChange={setValue} />
}

export const Default = {
  name: 'Default',
  render: () =>
    wrap(
      <PlaceInputDemo
        label="Destination"
        value={null}
        onSearchPlaces={async () => []}
      />,
    ),
}

export const WithHint = {
  name: 'With hint',
  render: () =>
    wrap(
      <PlaceInputDemo
        label="Leaving from"
        value={null}
        onSearchPlaces={async () => []}
        hint="Where are you starting this leg of the trip?"
      />,
    ),
}

export const Loading = {
  name: 'Loading',
  render: () =>
    wrap(
      <PlaceInputDemo
        label="Destination"
        value={null}
        defaultQuery="Magic Kingdom"
        onSearchPlaces={(): Promise<PlaceSuggestion[]> => new Promise(() => {})}
      />,
    ),
}

export const WithSuggestions = {
  name: 'With suggestions',
  render: () =>
    wrap(
      <PlaceInputDemo
        label="Destination"
        value={null}
        defaultQuery="Magic"
        onSearchPlaces={async () => mockSuggestions}
      />,
    ),
}

export const Selected = {
  name: 'Selected',
  render: () =>
    wrap(
      <PlaceInputDemo
        label="Destination"
        value={resolvedPlace}
        onSearchPlaces={async () => mockSuggestions}
      />,
    ),
}

export const NoResults = {
  name: 'No results',
  render: () =>
    wrap(
      <PlaceInputDemo
        label="Destination"
        value={null}
        defaultQuery="Somewhere that does not exist"
        onSearchPlaces={async () => []}
      />,
    ),
}

export const Error = {
  name: 'Error',
  render: () =>
    wrap(
      <PlaceInputDemo
        label="Destination"
        value={null}
        defaultQuery="Magic Kingdom"
        onSearchPlaces={async () => {
          throw new Error('Place search is currently unavailable.')
        }}
      />,
    ),
}

export const ManualFallback = {
  name: 'Manual fallback',
  render: () =>
    wrap(
      <PlaceInputDemo
        label="Leaving from"
        value={manualPlace}
        onSearchPlaces={async () => []}
      />,
    ),
}

export const AllVariants = {
  name: 'All variants',
  render: () => (
    <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PlaceInputDemo
        label="Empty"
        value={null}
        onSearchPlaces={async () => []}
        placeholder="Search for a place…"
      />
      <PlaceInputDemo
        label="With suggestions"
        value={null}
        defaultQuery="Magic"
        onSearchPlaces={async () => mockSuggestions}
      />
      <PlaceInputDemo
        label="Selected (resolved)"
        value={resolvedPlace}
        onSearchPlaces={async () => mockSuggestions}
      />
      <PlaceInputDemo
        label="Selected (manual)"
        value={manualPlace}
        onSearchPlaces={async () => []}
      />
    </div>
  ),
}
