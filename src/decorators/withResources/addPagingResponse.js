function transformMeta(meta) {
  const { total, per_page, current_page, last_page, from, to } = meta

  const api = {
    hasNext: () => current_page < last_page,
    hasPrevious: () => current_page !== 1,
  }

  return {
    size: per_page,
    current: current_page,
    total,
    pages: last_page,
    from,
    to,
    ...api,
  }
}

function isPaging(meta) {
  if (!meta) {
    return false
  }

  return ['total', 'per_page', 'current_page', 'last_page', 'from', 'to'].every(
    (key) => Object.keys(meta).includes(key)
  )
}

export default function addPagingResponse(response) {
  const { meta } = response

  if (isPaging(meta)) {
    Object.assign(
      response,
      {},
      {
        paging: { ...transformMeta(meta) },
      }
    )
  }

  return response
}
