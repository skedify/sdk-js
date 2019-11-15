import createResourceDescription from './util/createResourceDescription'

export const callbacks = createResourceDescription('callbacks', {
  includes: ['customer', 'office', 'subject'],
})
