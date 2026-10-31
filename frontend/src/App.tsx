/**
 * RetailVision - Master 3D Retail Marketplace & Analytics Application
 * Coordinates Scene Transitions:
 * Scene 1: Locked Storefront Window -> Unlock / Sign-In -> Flythrough
 * Scene 2: 3D Retail Marketplace Town with interactive buildings
 * Scene 3: Construct Plot with CSV Upload & Procedural Spawning
 * Features GTA 6 Style Corner Minimap Guide, Dynamic Day/Night, and Analytics Dashboards!
 */

import React, { useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { storeApi } from './api/client'
import { StorefrontScene } from './components/3d/StorefrontScene'
import { MarketplaceScene } from './components/3d/MarketplaceScene'
import { LockOverlay } from './components/ui/LockOverlay'
import { StoreAnalyticsModal } from './components/ui/StoreAnalyticsModal'
import { ConstructModal } from './components/ui/ConstructModal'
import { FloatingNav } from './components/ui/FloatingNav'
import { GtaMinimap } from './components/ui/GtaMinimap'
import { StoreCardTooltip } from './components/ui/StoreCardTooltip'
import type { Store, UserSession, TimeOfDay, GraphicsQuality } from './types'

export const App: React.FC = () => {
  // App Scene State: 'LOCKED' | 'MARKETPLACE'
  const [scene, setScene] = useState<'LOCKED' | 'MARKETPLACE'>('LOCKED')
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [userSession, setUserSession] = useState<UserSession | null>(null)
  const [isAudioMuted, setIsAudioMuted] = useState(false)

  // Simulation Environment Controls
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day')
  const [graphicsQuality, setGraphicsQuality] = useState<GraphicsQuality>('high')

  // Marketplace Stores State
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [hoveredStore, setHoveredStore] = useState<Store | null>(null)
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false)
  const [isConstructOpen, setIsConstructOpen] = useState(false)
  const [cameraTarget, setCameraTarget] = useState<[number, number, number] | null>(null)
  const [constructingStoreId, setConstructingStoreId] = useState<string | null>(null)

  // Load stores from FastAPI backend on mount
  useEffect(() => {
    loadStores()
  }, [])

  const loadStores = async () => {
    try {
      const data = await storeApi.listStores()
      setStores(data)
    } catch (err) {
      console.error('Failed to load stores from API', err)
    }
  }

  // Handle clicking the 3D Padlock on the storefront window
  const handleLockClick = () => {
    if (!isUnlocked) {
      setIsLockModalOpen(true)
    }
  }

  // Handle successful authentication
  const handleAuthSuccess = (session: UserSession) => {
    setUserSession(session)
    setIsLockModalOpen(false)
    setIsUnlocked(true)
    setIsTransitioning(true)

    // Cinematic delay: door opens, camera pushes through door, switch to marketplace
    setTimeout(() => {
      setScene('MARKETPLACE')
      setIsTransitioning(false)
    }, 1200)
  }

  // Handle clicking a store building in the 3D marketplace or GTA Minimap
  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store)
    setCameraTarget([store.grid_x, 0, store.grid_z])
    setIsAnalyticsOpen(true)
  }

  // Handle constructing a new store with procedural staging animation
  const handleStoreConstructed = (newStore: Store) => {
    setStores(prev => [...prev, newStore])
    // Focus camera directly on the new building
    setCameraTarget([newStore.grid_x, 0, newStore.grid_z])
    setConstructingStoreId(newStore.id)

    // After celebratory staging animation, open analytics modal
    setTimeout(() => {
      setConstructingStoreId(null)
      setSelectedStore(newStore)
      setIsAnalyticsOpen(true)
    }, 2200)
  }

  // Reset Camera back to overview
  const handleResetCamera = () => {
    setSelectedStore(null)
    setCameraTarget([0, 0, 0])
  }

  // Handle Logout
  const handleLogout = () => {
    setIsAnalyticsOpen(false)
    setIsConstructOpen(false)
    setSelectedStore(null)
    setUserSession(null)
    setIsUnlocked(false)
    setScene('LOCKED')
  }

  return (
    <main className="w-screen h-screen relative overflow-hidden bg-slate-950 font-sans">
      {/* SCENE 1: THE LUXURY STOREFRONT 3D LANDING PAGE */}
      {scene === 'LOCKED' && (
        <div className="w-full h-full relative">
          <StorefrontScene
            onUnlockClick={handleLockClick}
            isUnlocked={isUnlocked}
            isTransitioning={isTransitioning}
            isAudioMuted={isAudioMuted}
          />

          {/* Top Section: Minimalist Luxury Branding & Audio Controls */}
          <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
            {/* Branding */}
            <div className="flex items-center gap-3 pointer-events-auto">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-sm tracking-tighter">
                RV
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm md:text-base font-extrabold tracking-wider text-white">RETAILVISION</h1>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    3D Simulation
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-medium">
                  Your World of Retail Analytics
                </p>
              </div>
            </div>

            {/* Audio Toggle */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                title={isAudioMuted ? 'Enable Sound' : 'Mute Sound'}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 backdrop-blur-md transition-colors cursor-pointer shadow-lg"
              >
                {isAudioMuted ? (
                  <>
                    <VolumeX className="w-4 h-4 text-slate-400" />
                    <span className="text-[11px] font-medium hidden sm:inline">Muted</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] font-medium text-amber-300 hidden sm:inline">Sound On</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bottom Section: Instruction Pill & Copyright */}
          {!isLockModalOpen && !isUnlocked && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none text-center px-4 w-full max-w-lg">
              <div className="px-5 py-2.5 rounded-full bg-slate-900/90 backdrop-blur-xl border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-2xl shadow-black/80 flex items-center gap-2.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="tracking-wide">CLICK THE GOLDEN SMART LOCK TO ENTER</span>
              </div>
              <span className="text-[10px] tracking-wider text-slate-500 font-medium">
                © 2026 RetailVision • Real-Time 3D Simulation & Store Analytics
              </span>
            </div>
          )}

          {/* Sign-In Modal Overlay */}
          <LockOverlay
            isOpen={isLockModalOpen}
            onClose={() => setIsLockModalOpen(false)}
            onSuccess={handleAuthSuccess}
          />
        </div>
      )}

      {/* SCENE 2: 3D RETAIL MARKETPLACE & SIMULATION */}
      {scene === 'MARKETPLACE' && (
        <div className="w-full h-full relative">
          {/* Top Floating Navigation (Dropdown removed in favor of GTA 6 Minimap Guide!) */}
          <FloatingNav
            stores={stores}
            selectedStore={selectedStore}
            onOpenConstruct={() => {
              setCameraTarget([13.0, 0, -6.0]) // Fly to construct plot on empty land
              setIsConstructOpen(true)
            }}
            onResetCamera={handleResetCamera}
            userSession={userSession}
            onLogout={handleLogout}
            timeOfDay={timeOfDay}
            onToggleTimeOfDay={() => setTimeOfDay(t => t === 'day' ? 'night' : 'day')}
            graphicsQuality={graphicsQuality}
            onChangeGraphicsQuality={setGraphicsQuality}
          />

          {/* 3D Interactive Town */}
          <MarketplaceScene
            stores={stores}
            selectedStore={selectedStore}
            onStoreSelect={handleStoreSelect}
            onHoverStore={setHoveredStore}
            onConstructClick={() => setIsConstructOpen(true)}
            cameraTarget={cameraTarget}
            onCameraTargetReached={() => setCameraTarget(null)}
            onUserInteract={() => setCameraTarget(null)}
            onDeselectStore={() => setSelectedStore(null)}
            timeOfDay={timeOfDay}
            graphicsQuality={graphicsQuality}
            constructingStoreId={constructingStoreId}
          />

          {/* GTA 6 Corner Radar Minimap Guide */}
          <GtaMinimap
            stores={stores}
            selectedStore={selectedStore}
            onSelectStore={handleStoreSelect}
            onOpenConstruct={() => {
              setCameraTarget([13.0, 0, -6.0])
              setIsConstructOpen(true)
            }}
            onResetCamera={handleResetCamera}
          />

          {/* Hover Tooltip HUD over buildings in 3D */}
          <StoreCardTooltip store={hoveredStore} />

          {/* Floating Pill when a store is selected and dashboard is closed */}
          {selectedStore && !isAnalyticsOpen && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/50">
              <span className="text-xs font-semibold text-white">
                Focused on <span className="text-amber-400 font-bold">{selectedStore.name}</span>
              </span>
              <button
                onClick={() => setIsAnalyticsOpen(true)}
                className="px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Open Analytics
              </button>
              <button
                onClick={handleResetCamera}
                className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Reset to City
              </button>
            </div>
          )}

          {/* Store Analytics Modal Dashboard */}
          <StoreAnalyticsModal
            store={selectedStore}
            isOpen={isAnalyticsOpen}
            onClose={() => {
              setIsAnalyticsOpen(false)
              setCameraTarget(null)
            }}
          />

          {/* Construct Store Modal */}
          <ConstructModal
            isOpen={isConstructOpen}
            onClose={() => setIsConstructOpen(false)}
            onStoreConstructed={handleStoreConstructed}
          />
        </div>
      )}
    </main>
  )
}

export default App
