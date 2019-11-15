import createResourceDescription from './util/createResourceDescription'
import { HTTP_VERB_GET } from '../constants'

export const definedAvailability = createResourceDescription(
  'defined_availability',
  {
    allowed_methods: [HTTP_VERB_GET],
    filters: [
      'start',
      'end',
      'contacts',
      'offices',
      'subjects',
      'meeting_types',
      {
        name: 'timezone',
        key: 'format[timezone]',
      },
      {
        name: 'geolocation',
        key: 'location[geolocation]',
      },
    ],
    enable_pagination: false,
  }
)
