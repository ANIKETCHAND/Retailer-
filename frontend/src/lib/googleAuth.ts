/**
 * RetailVision - Google Identity Services (OAuth) Integration Engine
 * Configured with Client ID: 583335952268-6rbac1cq3v04pftd9n3ebi736sgoch8h.apps.googleusercontent.com
 * Supports:
 *  - Official Google Identity Services SDK (GSI)
 *  - Automatic JWT credential parsing & backend session creation
 *  - Native One Tap & Popup Sign-In
 *  - Seamless fallback to Google Account Selector
 */

import { authApi } from '../api/client'
import type { UserSession } from '../types'

export const DEFAULT_GOOGLE_CLIENT_ID =
  '583335952268-6rbac1cq3v04pftd9n3ebi736sgoch8h.apps.googleusercontent.com'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
          }) => void
          prompt: (momentListener?: (notification: any) => void) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon'
              theme?: 'outline' | 'filled_blue' | 'filled_black'
              size?: 'large' | 'medium' | 'small'
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
              shape?: 'rectangular' | 'pill' | 'circle' | 'square'
              logo_alignment?: 'left' | 'center'
              width?: number | string
            }
          ) => void
          disableAutoSelect: () => void
        }
      }
    }
  }
}

export function getGoogleClientId(): string {
  return (
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    localStorage.getItem('retailvision_google_client_id') ||
    DEFAULT_GOOGLE_CLIENT_ID
  )
}

export function setGoogleClientId(clientId: string): void {
  if (clientId && clientId.trim()) {
    localStorage.setItem('retailvision_google_client_id', clientId.trim())
  } else {
    localStorage.removeItem('retailvision_google_client_id')
  }
}

export function parseGoogleJwt(token: string): {
  email?: string
  name?: string
  picture?: string
  sub?: string
} {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.warn('Could not parse Google JWT:', e)
    return {}
  }
}

export function initGoogleIdentityServices(
  onSuccess: (session: UserSession) => void
): boolean {
  const clientId = getGoogleClientId()
  if (!clientId || typeof window === 'undefined' || !window.google?.accounts?.id) {
    return false
  }

  try {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential: string }) => {
        try {
          const claims = parseGoogleJwt(response.credential)
          const session = await authApi.googleLogin({
            credential: response.credential,
            email: claims.email,
            name: claims.name
          })
          if (session?.token) {
            localStorage.setItem('retailvision_token', session.token)
          }
          onSuccess(session)
        } catch (err) {
          console.error('Google OAuth backend validation error:', err)
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true
    })
    return true
  } catch (err) {
    console.warn('Could not initialize Google Identity Services:', err)
    return false
  }
}

export function renderGoogleButton(
  container: HTMLElement,
  onSuccess: (session: UserSession) => void
): boolean {
  const isInit = initGoogleIdentityServices(onSuccess)
  if (!isInit || !window.google?.accounts?.id) return false

  try {
    window.google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'pill',
      width: 280
    })
    return true
  } catch (e) {
    console.warn('Error rendering Google button:', e)
    return false
  }
}

export async function launchGoogleSignIn(
  onSuccess: (session: UserSession) => void,
  onFallback: () => void
): Promise<void> {
  const isInitialized = initGoogleIdentityServices(onSuccess)
  if (isInitialized && window.google?.accounts?.id) {
    window.google.accounts.id.prompt((notification: any) => {
      if (
        notification &&
        typeof notification.isNotDisplayed === 'function' &&
        notification.isNotDisplayed()
      ) {
        onFallback()
      } else if (
        notification &&
        typeof notification.isSkippedMoment === 'function' &&
        notification.isSkippedMoment()
      ) {
        onFallback()
      }
    })
  } else {
    onFallback()
  }
}
