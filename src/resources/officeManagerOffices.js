import createResourceDescription from './util/createResourceDescription'
import { HTTP_VERB_GET, HTTP_VERB_POST, HTTP_VERB_DELETE } from '../constants'

export const officeManagerOffices = createResourceDescription(
  'office_manager_offices',
  {
    includes: ['office_manager', 'office_manager.user', 'office'],
    filters: ['id', 'office_manager_id', 'office_id'],
    allowed_methods: [HTTP_VERB_GET, HTTP_VERB_POST, HTTP_VERB_DELETE],
  }
)
