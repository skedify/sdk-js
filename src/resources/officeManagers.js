import createResourceDescription from './util/createResourceDescription'

export const officeManagers = createResourceDescription(
  'office_managers',
  {
    includes: ['user', 'offices'],
  },
  {
    offices: createResourceDescription('offices'),
  }
)
