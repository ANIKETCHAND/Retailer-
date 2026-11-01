/**
 * RetailVision - Construct Your Own Store Modal
 * Features:
 *  - Store metadata collection (Name, Category, Description)
 *  - Drag & drop CSV dataset upload
 *  - Instant CSV preview & column validation
 *  - "Generate Quick Sample Dataset" 1-click helper for instant testing
 *  - Real-time error handling (failed CSV upload does NOT occupy a plot)
 *  - Celebration confetti & dynamic 3D building generation
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, UploadCloud, AlertCircle, FileText,
  Hammer, Info, Sparkles, CheckCircle2
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
  const [filePreview, setFilePreview] = useState<{ rows: number; headers: string[] } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const parseAndPreviewFile = async (selected: File) => {
    try {
      const text = await selected.text()
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
      if (lines.length > 1) {
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        setFilePreview({
          rows: lines.length - 1,
          headers: headers.slice(0, 6)
        })
      }
    } catch {
      setFilePreview(null)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      if (!selected.name.toLowerCase().endsWith('.csv')) {
        setErrorMsg('Please upload a valid .csv file.')
        setFile(null)
        setFilePreview(null)
        return
      }
      setFile(selected)
      setErrorMsg('')
      await parseAndPreviewFile(selected)

      if (!storeName) {
        const base = selected.name.replace('.csv', '').replace(/[-_]/g, ' ')
        const titleCase = base.charAt(0).toUpperCase() + base.slice(1)
        setStoreName(titleCase + ' Store')
      }
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0]
      if (!dropped.name.toLowerCase().endsWith('.csv')) {
        setErrorMsg('Please drop a valid .csv file.')
        return
      }
      setFile(dropped)
      setErrorMsg('')
      await parseAndPreviewFile(dropped)

      if (!storeName) {
        const base = dropped.name.replace('.csv', '').replace(/[-_]/g, ' ')
        setStoreName(base.charAt(0).toUpperCase() + base.slice(1) + ' Store')
      }
    }
  }

  // 1-Click Sample Generator
  const handleGenerateSampleDataset = () => {
    const products: Record<string, string[]> = {
      Electronics: ['Quantum Smartphone', 'Wireless Earbuds', 'Smart 4K TV', 'Gaming Laptop'],
      Grocery: ['Artisan Bread', 'Organic Milk', 'Fresh Berries', 'Cold Brew Coffee'],
      Clothing: ['Denim Jacket', 'Vintage Tee', 'Chino Pants', 'Sneakers'],
      Furniture: ['Ergonomic Chair', 'Solid Oak Desk', 'Floor Lamp', 'Bookshelf'],
      Accessories: ['Leather Wallet', 'Aviator Sunglasses', 'Chronograph Watch', 'Backpack'],
      Healthcare: ['Multivitamins', 'Pulse Oximeter', 'Organic Tea', 'Air Purifier'],
      Custom: ['Premium Item Alpha', 'Special Unit Beta', 'Deluxe Pack Gamma']
    }

    const prods = products[category] || products.Custom
    const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America']
    const cities = ['New York', 'London', 'Tokyo', 'Berlin', 'San Francisco', 'Toronto']

    let csvContent = 'Order ID,Order Date,Product,Category,Quantity,Unit Price,Total Amount,Region,City,Customer ID\n'
    const today = new Date()

    for (let i = 1; i <= 250; i++) {
      const p = prods[i % prods.length]
      const price = Math.round((20 + (i % 7) * 45) * 100) / 100
      const qty = (i % 3) + 1
      const total = Math.round(price * qty * 100) / 100
      const reg = regions[i % regions.length]
      const city = cities[i % cities.length]
      const d = new Date(today)
      d.setDate(today.getDate() - (i % 180))
      const dateStr = d.toISOString().split('T')[0]

      csvContent += `ORD-${category.substring(0, 3).toUpperCase()}-${1000 + i},${dateStr},"${p}",${category},${qty},${price},${total},${reg},${city},CUST-${100 + (i % 40)}\n`
    }

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const sampleFile = new File([blob], `${category.toLowerCase()}_sample_sales.csv`, { type: 'text/csv' })
    setFile(sampleFile)
    setFilePreview({
      rows: 250,
      headers: ['Order ID', 'Order Date', 'Product', 'Category', 'Quantity', 'Total Amount']
    })
    if (!storeName) {
      setStoreName(`${category} Emporium`)
    }
    setErrorMsg('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setErrorMsg('Please select or generate a retail sales CSV file.')
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
      setFilePreview(null)
      onStoreConstructed(newStore)
      onClose()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to construct store. Please verify CSV.')
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-white/15 shadow-2xl overflow-hidden p-6 sm:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Hammer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Construct New Retail Store</h3>
                <p className="text-xs text-slate-400">
                  Upload dataset to spawn interactive 3D store on next open plot
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
                  placeholder="e.g. Apex Electronics Flagship"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Retail Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
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
                placeholder="e.g. Modern showroom with smart displays and audio lounges"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* CSV Upload & Sample Generator */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Retail Sales CSV Dataset *
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSampleDataset}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate Quick Sample CSV</span>
                </button>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="relative border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-2xl p-5 text-center bg-slate-950/60 hover:bg-slate-950 transition-all cursor-pointer"
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <UploadCloud className="w-8 h-8 text-amber-400" />
                  {file ? (
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-slate-300 font-medium">
                        Drag & drop retail CSV here, or <span className="text-amber-400 underline">browse files</span>
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Required fields: Order Date, Product, Category, Quantity, Unit Price / Total
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Instant Dataset Preview */}
              {filePreview && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>
                      <strong className="text-white">{filePreview.rows}</strong> sales rows detected
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-xs">
                    Columns: {filePreview.headers.join(', ')}...
                  </div>
                </div>
              )}
            </div>

            {/* Explanatory Info */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>The Never-Ending Construction Loop:</strong> After your store is built, the construction site and crane will immediately relocate to the next empty plot in the city, ready for your next build.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
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
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/25 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
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
