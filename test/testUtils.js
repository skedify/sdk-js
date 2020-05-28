import * as mock from './mock'

// Re-export
export { mostRecentRequest, mockedRequests } from './mock'

export function mockMatchingURLResponse(
  urlOrRegExp,
  data,
  meta,
  warnings,
  status = 200
) {
  return mock.mockMatchingURLResponse(
    urlOrRegExp,
    { data, meta, warnings },
    status
  )
}

export function mockResponse(data, meta, warnings, errors, status = 200) {
  return mock.mockResponse({ data, meta, warnings, errors }, status)
}

export function mockNoContent() {
  return mock.mockResponse('', 204)
}

export function matchRequest(
  maybePromise,
  fakeData,
  fakeMeta,
  fakeWarnings,
  fakeStatus
) {
  mockResponse(fakeData, fakeMeta, fakeWarnings, fakeStatus)
  return Promise.resolve(maybePromise).then(() => mock.mostRecentRequest())
}
