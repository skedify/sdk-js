import { validateResponseFromExternalIdentifier } from './invariants'

export default function withExternalIdentifier(identifier) {
  const [type, value] = identifier.split('://')

  return resource =>
    resource
      .filter(item =>
        item[
          {
            external: 'external_id',
          }[type]
        ](value)
      )
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
