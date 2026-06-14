import type { Meta } from '@storybook/react'
import { FormRow } from '../components/ui/FormRow'

const meta = {
  title: 'Components/Forms/FormRow',
  component: FormRow,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof FormRow>

export default meta

const wrap = (children: React.ReactNode) => (
  <div style={{ width: 320 }}>{children}</div>
)

export const Default = {
  name: 'Default',
  render: () =>
    wrap(
      <FormRow label="Trip Name">
        <input className="form-control" type="text" defaultValue="Beach Maycation" />
      </FormRow>,
    ),
}

export const WithHint = {
  name: 'With hint',
  render: () =>
    wrap(
      <FormRow label="Destination" hint="Enter city and state or country">
        <input className="form-control" type="text" defaultValue="Orange Beach, AL" />
      </FormRow>,
    ),
}

export const WithSelect = {
  name: 'With select',
  render: () =>
    wrap(
      <FormRow label="Timezone">
        <select className="form-control" defaultValue="America/New_York">
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Chicago">Central Time (CT)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
        </select>
      </FormRow>,
    ),
}

export const WithTextArea = {
  name: 'With textarea',
  render: () =>
    wrap(
      <FormRow label="Notes" hint="Optional. Visible to all trip members.">
        <textarea className="form-control form-control--textarea" defaultValue="" placeholder="Add any notes…" />
      </FormRow>,
    ),
}
