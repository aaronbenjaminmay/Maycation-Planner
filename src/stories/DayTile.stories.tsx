import type { Meta } from '@storybook/react'
import { DayTile } from '../components/ui/DayTile'

const meta = {
  title: 'Patterns/DayTile',
  component: DayTile,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DayTile>

export default meta

export const WithDate = {
  name: 'With date',
  render: () => (
    <div style={{ width: 340 }}>
      <DayTile
        completedCount={2}
        date="Mon, Jun 9"
        dayNumber={1}
        iconName="plane"
        itemCount={5}
        onOpen={() => {}}
        title="Travel Day"
      />
    </div>
  ),
}

export const WithSubtitle = {
  name: 'With subtitle',
  render: () => (
    <div style={{ width: 340 }}>
      <DayTile
        completedCount={1}
        dayNumber={4}
        iconName="calendar"
        itemCount={3}
        onOpen={() => {}}
        subtitle="Disney Springs · 7:00 PM"
        title="Reservations"
      />
    </div>
  ),
}

export const NoProgress = {
  name: 'No progress (itemCount = 0)',
  render: () => (
    <div style={{ width: 340 }}>
      <DayTile
        completedCount={0}
        date="Wed, Jun 11"
        dayNumber={3}
        iconName="compass"
        itemCount={0}
        onOpen={() => {}}
        title="Explore Day"
      />
    </div>
  ),
}

export const Complete = {
  name: 'Complete',
  render: () => (
    <div style={{ width: 340 }}>
      <DayTile
        completedCount={4}
        date="Tue, Jun 10"
        dayNumber={2}
        iconName="ticket"
        itemCount={4}
        onOpen={() => {}}
        title="Activity Day"
      />
    </div>
  ),
}

export const Gallery = {
  name: 'Icon gallery',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 340 }}>
      <DayTile completedCount={0} date="Mon, Jun 9" dayNumber={1} iconName="calendar" itemCount={3} onOpen={() => {}} title="Calendar" />
      <DayTile completedCount={0} date="Tue, Jun 10" dayNumber={2} iconName="plane" itemCount={3} onOpen={() => {}} title="Plane" />
      <DayTile completedCount={0} date="Wed, Jun 11" dayNumber={3} iconName="compass" itemCount={3} onOpen={() => {}} title="Compass" />
      <DayTile completedCount={0} date="Thu, Jun 12" dayNumber={4} iconName="tree-palm" itemCount={3} onOpen={() => {}} title="Tree Palm" />
      <DayTile completedCount={0} date="Fri, Jun 13" dayNumber={5} iconName="star" itemCount={3} onOpen={() => {}} title="Star" />
      <DayTile completedCount={0} date="Sat, Jun 14" dayNumber={6} iconName="ticket" itemCount={3} onOpen={() => {}} title="Ticket" />
    </div>
  ),
}
