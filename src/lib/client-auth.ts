export const UNAUTHORIZED_EVENT = 'app-unauthorized'

type FetchInput = RequestInfo | URL

export async function fetchWithSession(input: FetchInput, init: RequestInit = {}) {
  const finalInit: RequestInit = {
    credentials: 'include',
    ...init,
    headers: {
      ...(init.headers || {}),
    },
  }

  const response = await fetch(input, finalInit)
  if (response.status === 401) {
    try {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    } catch {}
    throw new Error('Unauthorized')
  }
  return response
}


