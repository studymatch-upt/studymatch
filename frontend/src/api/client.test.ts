import { describe, expect, it, vi } from 'vitest'
import { ApiError, apiRequest } from './client'

function mockFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('apiRequest', () => {
  it('returns parsed JSON on success', async () => {
    mockFetch(new Response(JSON.stringify({ id: 1 }), { status: 200 }))

    await expect(apiRequest('/api/x')).resolves.toEqual({ id: 1 })
  })

  it('sends JSON content type only when there is a body', async () => {
    const fetchMock = mockFetch(new Response('{}', { status: 200 }))

    await apiRequest('/api/x', { method: 'POST', body: '{}' })

    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>
    expect(headers['Content-Type']).toBe('application/json')
  })

  it('turns problem details into an ApiError with field errors', async () => {
    const problem = {
      title: 'Validation failed',
      detail: 'One or more fields are invalid',
      fieldErrors: { name: 'must not be blank' },
    }
    mockFetch(new Response(JSON.stringify(problem), { status: 400 }))

    const error = await apiRequest('/api/x').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 400,
      message: 'One or more fields are invalid',
      fieldErrors: { name: 'must not be blank' },
    })
  })

  it('falls back to a generic message when the error body is not JSON', async () => {
    mockFetch(new Response('Bad Gateway', { status: 502 }))

    await expect(apiRequest('/api/x')).rejects.toThrow('Request failed with status 502')
  })
})
