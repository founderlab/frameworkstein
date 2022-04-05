
// Generate a more detailed error from a failed fetch request
export default async function handleFetchError(res, options={}) {
  const method = options.method || ''
  let errorMessage = ''
  try {
    const json = await res.clone().json()
    errorMessage = json.error
  }
  catch (err) {
    const text = await res.clone().text()
    errorMessage = text.slice(0, options.maxErrorMessageLength)
  }
  const err = new Error(`${method} ${res.url} (${res.status}): ${errorMessage}`)
  err.status = res.status
  throw err
}
