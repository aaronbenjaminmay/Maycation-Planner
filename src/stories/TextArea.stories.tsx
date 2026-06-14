import type { Meta } from '@storybook/react'
import { TextArea } from '../components/ui/TextArea'

const meta = {
  title: 'Components/Forms/TextArea',
  component: TextArea,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof TextArea>

export default meta

const wrap = (children: React.ReactNode) => (
  <div style={{ width: 320 }}>{children}</div>
)

export const Default = {
  name: 'Default',
  render: () =>
    wrap(
      <TextArea
        label="Notes"
        value="Arrive at airport by 10am. Check bags at United counter. Flight departs at 12:15pm."
        onChange={() => {}}
      />,
    ),
}

export const Empty = {
  name: 'Empty with placeholder',
  render: () =>
    wrap(
      <TextArea
        label="Notes"
        value=""
        onChange={() => {}}
        placeholder="Add any notes or details…"
      />,
    ),
}

export const WithHint = {
  name: 'With hint',
  render: () =>
    wrap(
      <TextArea
        label="Description"
        value=""
        onChange={() => {}}
        placeholder="Describe this item…"
        hint="Optional. Visible to all trip members."
      />,
    ),
}

export const Taller = {
  name: 'Taller (rows=6)',
  render: () =>
    wrap(
      <TextArea
        label="Trip Notes"
        value=""
        onChange={() => {}}
        rows={6}
        placeholder="General notes for the trip…"
      />,
    ),
}

export const Disabled = {
  name: 'Disabled',
  render: () =>
    wrap(
      <TextArea
        label="Notes"
        value="Arrive at airport by 10am."
        onChange={() => {}}
        disabled
      />,
    ),
}
