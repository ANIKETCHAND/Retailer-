/**
 * RetailVision - Google Identity Services (OAuth) Integration Engine
 * Supports:
 *  - Official Google Identity Services SDK (GSI)
 *  - Configurable Client ID from VITE_GOOGLE_CLIENT_ID or localStorage
 *  - Automatic JWT credential parsing & session persistence
 *  - Seamless fallback to authentic Google Account Selector when client ID is pending
 */

import { authApi } from '../api/client'
import type { UserSession } from '../types'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: (momentListener?: any) => void
          renderButton: (parent: HTMLElement, options: any) => void
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
    ''
  )
}

export function setGoogleClientId(clientId: string): void {
  if (clientId && clientId.trim()) {
    localStorage.setItem('retailvision_google_client_id', clientId.trim())
  } else {
    localStorage.removeItem('retailvision_google_client_id')
  }
}

export function parseGoogleJwt(token: string): { email?: string; name?: string; picture?: string } {
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

export function initGoogleIdentityServices(onSuccess: (session: UserSession) => void): boolean {
  const clientId = getGoogleClientId()
  if (!clientId || !window.google?.accounts?.id) {
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

export async function launchGoogleSignIn(
  onSuccess: (session: UserSession) => void,
  onFallback: () => void
): Promise<void> {
  const isInitialized = initGoogleIdentityServices(onSuccess)
  if (isInitialized && window.google?.accounts?.id) {
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback to in-app Google selector if popup was blocked or dismissed
        onFallback()
      }
    })
  } else {
    // If Client ID not yet set in environment, show the Google chooser
    onFallback()
  }
}
