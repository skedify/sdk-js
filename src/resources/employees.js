import createResourceDescription from './util/createResourceDescription'
import { HTTP_VERB_POST } from '../constants'

export const employees = createResourceDescription('employees', {
  includes: ['user', 'enterprise', 'roles'],
  filters: ['email', 'external_id', 'state', 'roles', 'match'],
  headers: {
    [HTTP_VERB_POST]: {
      suppress_activation_email: (value) => {
        if (value !== undefined) {
          return { 'X-suppress-activation-email': true }
        }

        return undefined
      },
    },
  },
})
