import createResourceDescription from './util/createResourceDescription'

export const admins = createResourceDescription('admins', {
  includes: ['user'],
})
