import type { Meta } from '@storybook/react'
import { SelectInput } from '../components/ui/SelectInput'

const meta = {
  title: 'Components/Forms/SelectInput',
  component: SelectInput,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SelectInput>

export default meta

const wrap = (children: React.ReactNode) => (
  <div style={{ width: 320 }}>{children}</div>
)

const timezoneOptions = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
]

const roleOptions = [
  { value: 'owner', label: 'Owner' },
  { value: 'planner', label: 'Planner' },
  { value: 'participant', label: 'Participant' },
  { value: 'viewer', label: 'Viewer' },
]

export const Default = {
  name: 'Default',
  render: () =>
    wrap(
      <SelectInput
        label="Timezone"
        value="America/New_York"
        onChange={() => {}}
        options={timezoneOptions}
      />,
    ),
}

export const WithHint = {
  name: 'With hint',
  render: () =>
    wrap(
      <SelectInput
        label="Member Role"
        value="planner"
        onChange={() => {}}
        options={roleOptions}
        hint="Controls what the member can see and do"
      />,
    ),
}

export const Disabled = {
  name: 'Disabled',
  render: () =>
    wrap(
      <SelectInput
        label="Timezone"
        value="America/New_York"
        onChange={() => {}}
        options={timezoneOptions}
        disabled
      />,
    ),
}

export const AllVariants = {
  name: 'All variants',
  render: () => (
    <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SelectInput label="Timezone" value="America/New_York" onChange={() => {}} options={timezoneOptions} />
      <SelectInput label="Role (with hint)" value="planner" onChange={() => {}} options={roleOptions} hint="Controls what the member can see and do" />
      <SelectInput label="Disabled" value="America/New_York" onChange={() => {}} options={timezoneOptions} disabled />
    </div>
  ),
}
