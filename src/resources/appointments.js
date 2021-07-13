import createResourceDescription from './util/createResourceDescription'
import { HTTP_VERB_POST } from '../constants'

export const appointments = createResourceDescription(
  'appointments',
  {
    includes: [
      'subject',
      'subject.subject_category',
      'office',
      'customer',
      'contact',
      'contact.employee',
      'contact.user',
      'possibilities',
      'possibilities.created_by',
      'accepted_possibility',
      'answers',
      'initiated_by',
      'outcomes',
      'appointment_outcomes',
      'calendar_links',
    ],
    filters: [
      'uuid',
      'state',
      'start',
      'end',
      'contact',
      'office',
      'order_by_start',
    ],
    headers: {
      [HTTP_VERB_POST]: {
        recaptcha: (value) => {
          if (value !== undefined) {
            return { 'X-Im-Not-A-Robot': value }
          }

          return undefined
        },
      },
    },
  },
  {
    availableContacts: createResourceDescription('available_contacts', {
      includes: ['user'],
    }),
    messages: createResourceDescription('messages'),
    answers: createResourceDescription('answers', {
      includes: ['question'],
    }),
    possibilities: createResourceDescription('possibilities'),
  }
)
