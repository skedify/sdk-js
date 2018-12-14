import createResourceDescription from './util/createResourceDescription'
import { HTTP_VERB_GET, HTTP_VERB_POST, HTTP_VERB_DELETE } from '../constants'

export const contactOffices = createResourceDescription('contact_offices', {
  includes: ['contact', 'contact.user', 'office'],
  filters: ['id', 'contact_id', 'office_id'],
  allowed_methods: [HTTP_VERB_GET, HTTP_VERB_POST, HTTP_VERB_DELETE],
})
