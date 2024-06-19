export interface SessionModel {
  user: {
    name: string
    email: string
    image: string
  },
  expires: Date // This is the expiry of the session, not any of the tokens within the session
}