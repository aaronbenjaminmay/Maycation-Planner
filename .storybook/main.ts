import { defineMain } from '@storybook/react-vite/node'

export default defineMain({
  stories: ['../src/stories/**/*.stories.@(ts|tsx)'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
})
