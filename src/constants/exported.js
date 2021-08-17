import createToken from '../util/createToken'

export const ERROR_RESOURCE = createToken()
export const ERROR_RESOURCE_INVALID_FILTER = createToken()
export const ERROR_RESOURCE_INVALID_INCLUDE = createToken()
export const ERROR_RESOURCE_INVALID_RESPONSE_INTERCEPTOR = createToken()
export const ERROR_RESOURCE_MISSING_ARGUMENT = createToken()
export const ERROR_RESOURCE_MISSING_PAGING_METHOD = createToken()

export const ERROR_RESPONSE = createToken()
export const ERROR_RESPONSE_MULTIPLE_RESULTS_FOUND = createToken()
export const ERROR_RESPONSE_NO_RESULTS_FOUND = createToken()

export const ERROR_RETRY = createToken()
export const ERROR_RETRY_MAX_ATTEMPTS_REACHED = createToken()

export const ERROR_SUBRESOURCE_INCLUDE_ALREADY_CALLED = createToken()
export const ERROR_SUBRESOURCE_INVALID_PARENT_ID = createToken()

export const MISCONFIGURED = createToken()
export const MISCONFIGURED_AUTH_PROVIDER = createToken()
export const MISCONFIGURED_LOCALE = createToken()
export const MISCONFIGURED_AUTH_PROVIDER_OPTIONS = createToken()
export const MISCONFIGURED_ON_ERROR_CALLBACK = createToken()

export const MISCONFIGURED_LOGGER = createToken()

export const MISCONFIGURED_TOKEN_TYPE = createToken()
export const MISCONFIGURED_ACCESS_TOKEN = createToken()
