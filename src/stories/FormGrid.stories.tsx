import type { Meta } from '@storybook/react'
import { FormGrid } from '../components/ui/FormGrid'
import { TextInput } from '../components/ui/TextInput'

const meta = {
  title: 'Components/Forms/FormGrid',
  component: FormGrid,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof FormGrid>

export default meta

export const Default = {
  name: 'Two-column grid',
  render: () => (
    <div style={{ width: 560 }}>
      <FormGrid>
        <TextInput label="Start Date" type="date" value="2025-06-07" onChange={() => {}} />
        <TextInput label="End Date" type="date" value="2025-06-12" onChange={() => {}} />
      </FormGrid>
    </div>
  ),
}

export const ThreeFields = {
  name: 'Odd field count (last spans full)',
  render: () => (
    <div style={{ width: 560 }}>
      <FormGrid>
        <TextInput label="First Name" value="Aaron" onChange={() => {}} />
        <TextInput label="Last Name" value="May" onChange={() => {}} />
        <TextInput label="Email" type="email" value="user@example.com" onChange={() => {}} />
      </FormGrid>
    </div>
  ),
}

export const DateRange = {
  name: 'Date range pattern',
  render: () => (
    <div style={{ width: 560 }}>
      <FormGrid>
        <TextInput label="Trip Starts" type="date" value="2025-06-07" onChange={() => {}} />
        <TextInput label="Trip Ends" type="date" value="2025-06-12" onChange={() => {}} />
      </FormGrid>
    </div>
  ),
}
