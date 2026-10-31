/**
 * RetailVision - Luxury Glassmorphic Sign-In Overlay
 * Architectural glassmorphic sign-in panel appearing seamlessly when
 * the interactive 3D golden smart lock is engaged.
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ShieldCheck, Sparkles, ArrowRight, AlertCircle, KeyRound, Building2 } from 'lucide-react'
import { authApi } from '../../api/client'
import type { UserSession } from '../../types'

interface LockOverlayProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (session: UserSession) => void
}

export const LockOverlay: React.FC<LockOverlayProps> = ({ isOpen, onClose, onSuccess }) => {
  const [login, setLogin] = useState('admin@retailvision.com')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)

    try {
      const session = await authApi.login(login, password)
      onSuccess(session)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Authentication failed. Please check credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoAccount = () => {
    setLogin('admin@retailvision.com')
    setPassword('admin123')
    setErrorMsg('')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md p-8 rounded-3xl bg-slate-900/85 border border-amber-500/25 shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-2xl"
        >
          {/* Subtle Luxury Golden & Emerald Ambient Glows */}
          <div className="absolute -top-28 -right-28 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-28 -left-28 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-400/5 border border-amber-500/30 text-amber-400 mb-3.5 shadow-lg shadow-amber-500/10">
              <KeyRound className="w-7 h-7" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-[10px] font-bold tracking-[0.25em] text-amber-400 uppercase">
                RETAILVISION BOUTIQUE
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Unlock Marketplace
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Enter your credentials to swing open the showroom doors and access the 3D retail simulation.
            </p>
          </div>

          {/* Error Callout */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Operator Email or Username
              </label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                placeholder="admin@retailvision.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Demo Credentials Autofill */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={fillDemoAccount}
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors cursor-pointer font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Fill Demo Credentials
              </button>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SHA-256 Verified</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  <Building2 className="w-4 h-4" />
                  <span>Authorize & Enter 3D Store</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Dismiss button */}
          <button
            onClick={onClose}
            className="w-full mt-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Cancel & Return to Storefront
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
