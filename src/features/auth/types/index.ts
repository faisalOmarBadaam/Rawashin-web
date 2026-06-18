export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    fullName: string
    phoneNumber: string
    roles: string[]
  }
}