import { validateResponseFromExternalIdentifier } from './invariants'

const TYPE_CONVERSION = {
  external: 'external_id',
}

export default function withExternalIdentifier(identifier) {
  const [type, value] = identifier.split('://')

  return resource =>
    resource
      .filter(item => item[TYPE_CONVERSION[type]](value))
      .addResponseInterceptor(response => {
        validateResponseFromExternalIdentifier({ response })

        /**
         * Return the first result
         */
        return Object.assign({}, response, {
          data: response.data[0],
        })
      })
}
