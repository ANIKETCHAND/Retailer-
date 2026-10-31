/**
 * RetailVision - Upgraded Lock & Sign-In Overlay
 * Integrates the shadcn AuthForm component into the 3D storefront entrance flow.
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { AuthForm } from './sign-in'
import { authApi } from '../../api/client'
import type { UserSession } from '../../types'

interface LockOverlayProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (session: UserSession) => void
}

export const LockOverlay: React.FC<LockOverlayProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleEmailSubmit = async (data: { email: string; password?: string }) => {
    setErrorMsg('')
    setIsLoading(true)

    try {
      const email = data.email || 'admin@retailvision.com'
      const password = data.password || 'admin123'
      const session = await authApi.login(email, password)
      onSuccess(session)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Authentication failed. Please verify credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: 'google' | 'microsoft' | 'apple' | 'sso') => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      // Demo SSO / Social Sign-In simulation for fast 3D testing
      const session: UserSession = {
        user_id: 1,
        username: `${provider}_user`,
        email: `user@${provider}.com`,
        token: `mock_jwt_${provider}_${Date.now()}`
      }
      setTimeout(() => {
        setIsLoading(false)
        onSuccess(session)
      }, 400)
    } catch {
      setIsLoading(false)
    }
  }

  const handleEmailLink = () => {
    setErrorMsg('')
    alert('Magic link has been sent to your email!')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-md"
        >
          {/* Dismiss button */}
          <button
            onClick={onClose}
            title="Close"
            className="absolute -top-3 -right-3 z-20 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-xl cursor-pointer hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Integrated shadcn AuthForm */}
          <AuthForm
            onEmailSubmit={handleEmailSubmit}
            onSocialSignIn={handleSocialSignIn}
            onEmailLink={handleEmailLink}
            isLoading={isLoading}
            error={errorMsg}
            defaultEmail="admin@retailvision.com"
            defaultPassword="admin123"
            className="border-slate-800 bg-slate-900/95 text-slate-100"
          />
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
