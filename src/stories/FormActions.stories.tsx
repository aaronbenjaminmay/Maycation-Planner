import type { Meta } from '@storybook/react'
import { FormActions } from '../components/ui/FormActions'
import { Button } from '../components/ui/Button'
import { IconButton } from '../components/ui/IconButton'

const meta = {
  title: 'Components/Forms/FormActions',
  component: FormActions,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof FormActions>

export default meta

export const Default = {
  name: 'Two buttons (Cancel / Save)',
  render: () => (
    <div style={{ width: 480 }}>
      <FormActions>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save Trip</Button>
      </FormActions>
    </div>
  ),
}

export const WithLeadingAction = {
  name: 'With leading destructive action',
  render: () => (
    <div style={{ width: 480 }}>
      <FormActions
        leading={<IconButton icon="delete" label="Delete trip" variant="destructive" />}
      >
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save</Button>
      </FormActions>
    </div>
  ),
}

export const DestructiveConfirm = {
  name: 'Destructive confirm pattern',
  render: () => (
    <div style={{ width: 480 }}>
      <FormActions>
        <Button variant="secondary">Cancel</Button>
        <Button variant="destructive">Delete Trip</Button>
      </FormActions>
    </div>
  ),
}

export const SingleAction = {
  name: 'Single action',
  render: () => (
    <div style={{ width: 480 }}>
      <FormActions>
        <div />
        <Button variant="primary">Create Trip</Button>
      </FormActions>
    </div>
  ),
}
