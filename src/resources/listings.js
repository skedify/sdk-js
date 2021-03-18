import createResourceDescription from './util/createResourceDescription'

export const listings = createResourceDescription('listings', {
  filters: ['external_id'],
  enable_pagination: false,
  enable_id_filter: false,
})
