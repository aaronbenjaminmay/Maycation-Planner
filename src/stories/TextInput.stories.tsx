import type { Meta } from '@storybook/react'
import { TextInput } from '../components/ui/TextInput'

const meta = {
  title: 'Components/Forms/TextInput',
  component: TextInput,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof TextInput>

export default meta

const wrap = (children: React.ReactNode) => (
  <div style={{ width: 320 }}>{children}</div>
)

export const Default = {
  name: 'Default',
  render: () =>
    wrap(<TextInput label="Trip Name" value="Beach Maycation" onChange={() => {}} />),
}

export const WithPlaceholder = {
  name: 'With placeholder',
  render: () =>
    wrap(<TextInput label="Trip Name" value="" onChange={() => {}} placeholder="e.g. Beach Maycation" />),
}

export const WithHint = {
  name: 'With hint',
  render: () =>
    wrap(
      <TextInput
        label="Destination"
        value="Orange Beach, AL"
        onChange={() => {}}
        hint="Enter the city and state or country"
      />,
    ),
}

export const Email = {
  name: 'Email type',
  render: () =>
    wrap(<TextInput label="Email" type="email" value="user@example.com" onChange={() => {}} />),
}

export const Password = {
  name: 'Password type',
  render: () =>
    wrap(<TextInput label="Password" type="password" value="secret" onChange={() => {}} />),
}

export const Disabled = {
  name: 'Disabled',
  render: () =>
    wrap(<TextInput label="Trip Name" value="Beach Maycation" onChange={() => {}} disabled />),
}

export const AllVariants = {
  name: 'All variants',
  render: () => (
    <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <TextInput label="Default" value="Beach Maycation" onChange={() => {}} />
      <TextInput label="With hint" value="" onChange={() => {}} placeholder="e.g. Beach Maycation" hint="Choose a memorable name" />
      <TextInput label="Disabled" value="Beach Maycation" onChange={() => {}} disabled />
    </div>
  ),
}
