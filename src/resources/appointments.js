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
    ],
    filters: ['state', 'start', 'end'],
    headers: {
      [HTTP_VERB_POST]: {
        recaptcha: value => ({ 'X-Im-Not-A-Robot': value }),
      },
    },
  },
  {
    answers: createResourceDescription('answers', {
      includes: ['question'],
    }),
    possibilities: createResourceDescription('possibilities'),
  }
)
