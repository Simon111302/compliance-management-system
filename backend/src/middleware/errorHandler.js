export function errorHandler(error, _request, response, _next) {
  console.error(error)

  if (error.type === 'entity.too.large') {
    response.status(413).json({ message: 'Evidence file must be 10 MB or less' })
    return
  }

  response.status(500).json({ message: 'Database request failed' })
}
