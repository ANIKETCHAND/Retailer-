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
import { cartoonTextStyle, pillShineStyle } from './GamePillButtons'

const gameShellStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #38bdf8 0%, #0ea5e9 20%, #0284c7 60%, #034f7c 100%)',
  border: '3.5px solid #ffffff',
  borderRadius: '28px',
  boxShadow: '0 25px 60px rgba(2, 132, 199, 0.65), inset 0 2px 6px rgba(255, 255, 255, 0.8)',
}

const gameInnerCanvasStyle: React.CSSProperties = {
  background: 'rgba(2, 22, 44, 0.88)',
  border: '2px solid rgba(255, 255, 255, 0.28)',
  borderRadius: '20px',
  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.4)',
}

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
      let text = await selected.text()
      if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1)
      }
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
      if (lines.length > 1) {
        const headerLine = lines[0]
        let delim = ','
        const commaCount = (headerLine.match(/,/g) || []).length
        const semiCount = (headerLine.match(/;/g) || []).length
        const tabCount = (headerLine.match(/\t/g) || []).length
        if (semiCount > commaCount && semiCount > tabCount) delim = ';'
        else if (tabCount > commaCount && tabCount > semiCount) delim = '\t'

        const headers = headerLine.split(delim).map(h => h.trim().replace(/^["']|["']$/g, ''))
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-xl overflow-hidden p-6 sm:p-7"
          style={gameShellStyle}
        >
          {/* Top Reflection Shine */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '45px',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 100%)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between pb-4 border-b-2 border-white/25">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/20 border-2 border-white text-yellow-300 shadow-md">
                <Hammer className="w-6 h-6 drop-shadow-sm" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)' }}>
                  Construct New Retail Store
                </h3>
                <p className="text-xs text-sky-100 font-medium">
                  Upload dataset to spawn interactive 3D store on next open plot
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/35 border-2 border-white text-white flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 flex items-center gap-2 p-3 my-4 rounded-xl bg-red-500/25 border-2 border-red-300 text-white font-bold text-xs shadow-md"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-200" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="relative z-10 space-y-4 pt-4">
            <div className="p-4 sm:p-5 space-y-4" style={gameInnerCanvasStyle}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-sky-100 mb-1">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Apex Electronics Flagship"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-sky-950/80 border-2 border-white/30 text-white placeholder-sky-200/50 text-xs font-semibold focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-sky-100 mb-1">
                    Retail Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-sky-950/80 border-2 border-white/30 text-white text-xs font-bold focus:outline-none focus:border-white transition-colors"
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
                <label className="block text-xs font-black uppercase tracking-wider text-sky-100 mb-1">
                  Store Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Modern showroom with smart displays and audio lounges"
                  className="w-full px-3.5 py-2 rounded-xl bg-sky-950/80 border-2 border-white/30 text-white placeholder-sky-200/50 text-xs font-medium focus:outline-none focus:border-white transition-colors"
                />
              </div>

              {/* CSV Upload & Sample Generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-black uppercase tracking-wider text-sky-100">
                    Retail Sales CSV Dataset *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSampleDataset}
                    className="text-xs font-black text-yellow-300 hover:text-yellow-200 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Quick Sample CSV</span>
                  </button>
                </div>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="relative border-2 border-dashed border-white/40 hover:border-white rounded-2xl p-5 text-center bg-sky-950/50 hover:bg-sky-950/80 transition-all cursor-pointer"
                >
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <UploadCloud className="w-8 h-8 text-yellow-300 drop-shadow-sm" />
                    {file ? (
                      <div className="flex items-center gap-2 text-emerald-300 font-black text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-white font-bold">
                          Drag & drop retail CSV here, or <span className="text-yellow-300 underline">browse files</span>
                        </p>
                        <p className="text-[10px] text-sky-200 font-medium">
                          Required fields: Order Date, Product, Category, Quantity, Unit Price / Total
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Instant Dataset Preview */}
                {filePreview && (
                  <div className="mt-2.5 p-3 rounded-xl bg-sky-950/90 border-2 border-white/20 text-xs text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-300" />
                      <span>
                        <strong className="text-yellow-300 font-black">{filePreview.rows}</strong> sales rows detected
                      </span>
                    </div>
                    <div className="text-[11px] text-sky-200 truncate max-w-xs font-mono">
                      Columns: {filePreview.headers.join(', ')}...
                    </div>
                  </div>
                )}
              </div>

              {/* Explanatory Info */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-sky-950/60 border border-white/20 text-sky-100 text-[11px] leading-relaxed font-medium">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-yellow-300" />
                <span>
                  <strong className="text-white">The Never-Ending Construction Loop:</strong> After your store is built, the construction site and crane will immediately relocate to the next empty plot in the city, ready for your next build.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full font-bold text-xs text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="relative py-2.5 px-6 rounded-full text-white font-black text-xs flex items-center gap-2 shadow-xl cursor-pointer disabled:opacity-50 transition-all duration-200 active:scale-95 overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, #f59e0b 0%, #ea580c 45%, #c2410c 100%)',
                  border: '3px solid #ffffff',
                  boxShadow: '0 6px 20px rgba(234, 88, 12, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
                  ...cartoonTextStyle,
                }}
              >
                <div style={pillShineStyle} />
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
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
