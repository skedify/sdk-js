import createResourceDescription from './util/createResourceDescription'

export const integrations = createResourceDescription('integrations', {
  filters: [{ name: 'type', key: 'filter[type]' }],
  enable_pagination: false,
  enable_id_filter: false,
})
