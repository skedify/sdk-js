import { get } from '../../secret'

export default function executeResponseInterceptors(instance, response) {
  const { responseInterceptors } = get(instance)

  return responseInterceptors.reduce(
    (interceptee, interceptor) => interceptor(interceptee),
    response
  )
}
