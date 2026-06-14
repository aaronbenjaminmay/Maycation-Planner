import type { Meta } from '@storybook/react'
import { PageControls } from '../components/ui/PageControls'
import { IconButton } from '../components/ui/IconButton'
import { Button } from '../components/ui/Button'

const meta = {
  title: 'Components/Navigation/PageControls',
  component: PageControls,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PageControls>

export default meta

export const Default = {
  name: 'Back / Add',
  render: () => (
    <PageControls
      leading={<IconButton icon="back" label="Back" onClick={() => {}} />}
      trailing={<IconButton icon="add" label="Add item" variant="primary" onClick={() => {}} />}
    />
  ),
}

export const BackOnly = {
  name: 'Back only',
  render: () => (
    <PageControls
      leading={<IconButton icon="back" label="Back" onClick={() => {}} />}
    />
  ),
}

export const BackWithSettings = {
  name: 'Back / Settings',
  render: () => (
    <PageControls
      leading={<IconButton icon="back" label="Back" onClick={() => {}} />}
      trailing={<IconButton icon="settings" label="Trip settings" onClick={() => {}} />}
    />
  ),
}

export const WithSaveAction = {
  name: 'With save button',
  render: () => (
    <PageControls
      leading={<IconButton icon="back" label="Cancel" onClick={() => {}} />}
      trailing={<Button variant="primary">Save</Button>}
    />
  ),
}
