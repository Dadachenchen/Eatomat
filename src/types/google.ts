export interface GoogleUser {
  email: string
  name: string
  picture: string
}

export interface GoogleFile {
  id: string
  name: string
  mimeType: string
}

export interface GoogleAuthResponse {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
}
