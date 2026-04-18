export type ApiConfig = {
  baseURL: string
  timeout: number
  withCredentials: boolean
}

export const apiConfig: ApiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://rwashnpreproduction.runasp.net',
  timeout: 30000,
  withCredentials: false
}
