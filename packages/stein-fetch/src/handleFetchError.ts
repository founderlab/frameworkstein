interface HandleFetchErrorOptions {
  method?: string;
  maxErrorMessageLength?: number;
  verbose?: boolean;
}

interface FetchError extends Error {
  status: number;
}

// Generate a more detailed error from a failed fetch request
export default async function handleFetchError(
  res: Response,
  options: HandleFetchErrorOptions = {}
): Promise<never> {
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
  const error = new Error(
    options.verbose ? `${method} ${res.url} (${res.status}): ${errorMessage}` : errorMessage
  ) as FetchError;
  error.status = res.status;
  throw error;
}
