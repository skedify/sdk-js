import createResourceDescription from './util/createResourceDescription'
import { HTTP_VERB_GET } from '../constants'

export const timetable = createResourceDescription('timetable', {
  filters: [
    'start',
    'end',
    'office',
    'subject',
    'meeting_type',
    'contacts',
    {
      name: 'timezone',
      key: 'format[timezone]',
    },
    {
      name: 'geolocation',
      key: 'location[geolocation]',
    },
  ],
  allowed_methods: [HTTP_VERB_GET],
  enable_pagination: false,
})
