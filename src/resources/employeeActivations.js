import createResourceDescription from './util/createResourceDescription'
import { HTTP_VERB_GET } from '../constants'

export const employeeActivations = createResourceDescription(
  'employee_activations',
  {
    allowed_methods: [HTTP_VERB_GET],
    includes: ['employee', 'employee.enterprise'],
  }
)
