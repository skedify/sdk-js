import createResourceDescription from './util/createResourceDescription'
import { HTTP_VERB_GET, HTTP_VERB_POST, HTTP_VERB_DELETE } from '../constants'

export const contactOfficeSubjects = createResourceDescription(
  'contact_office_subjects',
  {
    includes: [
      'contact_office',
      'contact_office.contact',
      'contact_office.office',
      'subject',
    ],
    filters: ['id', 'contact_office_id', 'subject_id'],
    allowed_methods: [HTTP_VERB_GET, HTTP_VERB_POST, HTTP_VERB_DELETE],
  }
)
