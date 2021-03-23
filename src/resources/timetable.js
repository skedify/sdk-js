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
    { name: 'timezone', key: 'format[timezone]' },
    { name: 'geolocation', key: 'location[geolocation]' },
    { name: 'country', key: 'location[country]' },
    { name: 'postal_code', key: 'location[postal_code]' },
  ],
  allowed_methods: [HTTP_VERB_GET],
  enable_pagination: false,
  enable_id_filter: false,
})
