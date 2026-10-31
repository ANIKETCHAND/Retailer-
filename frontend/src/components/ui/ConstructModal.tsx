/**
 * RetailVision - Construct Your Own Store Modal
 * Handles CSV upload, metadata collection, backend validation,
 * celebration confetti, and procedural 3D building generation.
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, UploadCloud, AlertCircle, FileText,
  Hammer, Info
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { storeApi } from '../../api/client'
import type { Store } from '../../types'

interface ConstructModalProps {
  isOpen: boolean
  onClose: () => void
  onStoreConstructed: (newStore: Store) => void
}

const CATEGORIES = [
  'Electronics',
  'Grocery',
  'Clothing',
  'Furniture',
  'Accessories',
  'Healthcare',
  'Custom'
]

export const ConstructModal: React.FC<ConstructModalProps> = ({
  isOpen,
  onClose,
  onStoreConstructed
}) => {
  const [storeName, setStoreName] = useState('')
  const [category, setCategory] = useState('Electronics')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      if (!selected.name.toLowerCase().endsWith('.csv')) {
        setErrorMsg('Please upload a valid .csv file.')
        setFile(null)
        return
      }
      setFile(selected)
      setErrorMsg('')
      if (!storeName) {
        const base = selected.name.replace('.csv', '').replace(/[-_]/g, ' ')
        const titleCase = base.charAt(0).toUpperCase() + base.slice(1)
        setStoreName(titleCase + ' Store')
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0]
      if (!dropped.name.toLowerCase().endsWith('.csv')) {
        setErrorMsg('Please drop a valid .csv file.')
        return
      }
      setFile(dropped)
      setErrorMsg('')
      if (!storeName) {
        const base = dropped.name.replace('.csv', '').replace(/[-_]/g, ' ')
        setStoreName(base.charAt(0).toUpperCase() + base.slice(1) + ' Store')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setErrorMsg('Please select a retail sales CSV file.')
      return
    }
    if (!storeName.trim()) {
      setErrorMsg('Please enter a store name.')
      return
    }

    setIsUploading(true)
    setErrorMsg('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', storeName.trim())
      formData.append('category', category)
      formData.append('description', description.trim())

      const newStore = await storeApi.constructStore(formData)

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      })

      setStoreName('')
      setDescription('')
      setFile(null)
      onStoreConstructed(newStore)
      onClose()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to construct store. Please verify CSV schema.')
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden p-6 sm:p-8"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Hammer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Construct New Retail Store</h3>
                <p className="text-xs text-slate-400">Upload retail CSV dataset to procedurally spawn a new 3D building.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 my-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Store Name *
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Cyber City Electronics"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Retail Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Store Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Specialized flagship retail outlet"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Retail Sales CSV Dataset *
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="relative border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-6 text-center bg-slate-900/60 hover:bg-slate-900/90 transition-all cursor-pointer"
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <UploadCloud className="w-8 h-8 text-blue-400" />
                  {file ? (
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                      <FileText className="w-4 h-4" />
                      <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-slate-300 font-medium">
                        Drag & drop retail CSV here, or <span className="text-blue-400 underline">browse files</span>
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Supports common aliases: date, product, category, quantity, price, region
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] leading-relaxed">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Upon construction, a custom 3D building will automatically spawn on an open plot in the marketplace. The backend validates your CSV and derives sales analytics immediately.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/25 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Hammer className="w-3.5 h-3.5" />
                    <span>Construct Store & Spawn in 3D</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
