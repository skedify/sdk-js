export function withExposedAuthorization() {
  return (instance) => {
    instance.getAuthorizationHeader = () => undefined
  }
}
