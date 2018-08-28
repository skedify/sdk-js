import createResourceDescription from './util/createResourceDescription'

export const insights = createResourceDescription(
  'insights',
  {},
  {
    auth: createResourceDescription('auth'),
  }
)
