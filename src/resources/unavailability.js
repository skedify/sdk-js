import createResourceDescription from './util/createResourceDescription'
import { HTTP_VERB_GET } from '../constants'

export const unavailability = createResourceDescription('unavailability', {
  allowed_methods: [HTTP_VERB_GET],
  filters: [
    'start',
    'end',
    'contacts',
    'offices',
    'subjects',
    {
      name: 'timezone',
      key: 'format[timezone]',
    },
  ],
  enable_pagination: false,
})
