/**
 * RetailVision - Master 3D Retail Marketplace & Analytics Application
 * Coordinates Scene Transitions:
 * Scene 1: Locked Storefront Window -> Unlock / Sign-In -> Flythrough
 * Scene 2: 3D Retail Marketplace Town with interactive buildings & infinite procedural plots
 * Scene 3: Construct Plot with CSV Upload & Never-Ending Construction Loop
 * Features GTA 6 Style Corner Minimap Guide, Dynamic Day/Night, and Analytics Dashboards!
 */

import React, { useEffect, useState } from 'react'
import { authApi, storeApi, findNextAvailablePlot } from './api/client'
import { StorefrontScene } from './components/3d/StorefrontScene'
import { MarketplaceScene } from './components/3d/MarketplaceScene'
import { LockOverlay } from './components/ui/LockOverlay'
import { StoreAnalyticsModal } from './components/ui/StoreAnalyticsModal'
import { ConstructModal } from './components/ui/ConstructModal'
import { FloatingNav } from './components/ui/FloatingNav'
import { GtaMinimap } from './components/ui/GtaMinimap'
import { StoreCardTooltip } from './components/ui/StoreCardTooltip'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { GamePillButtons, CityViewPill } from './components/ui/GamePillButtons'
import type { Store, UserSession, TimeOfDay, GraphicsQuality } from './types'

export const App: React.FC = () => {
  // App Scene State: 'LOCKED' | 'MARKETPLACE'
  const [scene, setScene] = useState<'LOCKED' | 'MARKETPLACE'>('LOCKED')
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [userSession, setUserSession] = useState<UserSession | null>(null)

  // In-World Welcome Options (Requirement 2: Option A vs Option B)
  const [showWelcomeOptions, setShowWelcomeOptions] = useState(true)

  // Store Focus Mode: When true, camera is focused on a store and "City View" pill is displayed
  const [isStoreFocusMode, setIsStoreFocusMode] = useState(false)
  const [isPlotFocusMode, setIsPlotFocusMode] = useState(false)
  const [exploreIndex, setExploreIndex] = useState(0)

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
      setShowWelcomeOptions(true)
    }, 1200)
  }

  // OPTION A: EXPLORE EXISTING STORES
  const handleExploreStores = () => {
    setShowWelcomeOptions(false)
    setIsPlotFocusMode(false)
    if (stores.length > 0) {
      setIsStoreFocusMode(true)
      const targetStore = stores[0]
      setExploreIndex(0)
      setSelectedStore(targetStore)
      setCameraTarget([targetStore.grid_x, 0, targetStore.grid_z])
    } else {
      setCameraTarget([0, 0, 0])
    }
  }

  // Tour next store while exploring
  const handleNextStore = () => {
    if (stores.length === 0) return
    const nextIdx = (exploreIndex + 1) % stores.length
    setExploreIndex(nextIdx)
    const nextStore = stores[nextIdx]
    setSelectedStore(nextStore)
    setCameraTarget([nextStore.grid_x, 0, nextStore.grid_z])
  }

  // Return back to panoramic City View mode & restore explore/build options
  const handleReturnToCityView = () => {
    setIsStoreFocusMode(false)
    setIsPlotFocusMode(false)
    setSelectedStore(null)
    setIsAnalyticsOpen(false)
    setIsConstructOpen(false)
    setCameraTarget([0, 0, 0])
    setShowWelcomeOptions(true)
  }

  // OPTION B: CONSTRUCT NEW STORE
  const handleConstructNewStore = () => {
    setShowWelcomeOptions(false)
    setIsStoreFocusMode(false)
    setIsPlotFocusMode(true)
    const nextPlot = findNextAvailablePlot(stores)
    // Smoothly fly camera to the highlighted empty plot
    setCameraTarget([nextPlot.grid_x, 0, nextPlot.grid_z])
    setIsConstructOpen(true)
  }

  // Handle clicking a store building in the 3D marketplace or GTA Minimap
  const handleStoreSelect = (store: Store) => {
    setShowWelcomeOptions(false)
    setIsPlotFocusMode(false)
    setIsStoreFocusMode(true)
    const idx = stores.findIndex(s => s.id === store.id)
    if (idx !== -1) setExploreIndex(idx)
    setSelectedStore(store)
    setCameraTarget([store.grid_x, 0, store.grid_z])
    setIsAnalyticsOpen(true)
  }

  // Handle constructing a new store with procedural staging animation
  const handleStoreConstructed = (newStore: Store) => {
    if (!newStore || typeof newStore !== 'object' || !newStore.id) {
      console.warn('Invalid store received from constructStore:', newStore)
      return
    }
    setStores(prev => [...prev.filter(s => s.id !== newStore.id), newStore])
    // Focus camera directly on the new building
    const targetX = typeof newStore.grid_x === 'number' ? newStore.grid_x : 13.0
    const targetZ = typeof newStore.grid_z === 'number' ? newStore.grid_z : -6.0
    setCameraTarget([targetX, 0, targetZ])
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
    setIsStoreFocusMode(false)
    setIsPlotFocusMode(false)
    setSelectedStore(null)
    setIsAnalyticsOpen(false)
    setIsConstructOpen(false)
    setCameraTarget([0, 0, 0])
    setShowWelcomeOptions(true)
  }

  // Handle Logout
  const handleLogout = async () => {
    await authApi.logout()
    setIsAnalyticsOpen(false)
    setIsConstructOpen(false)
    setIsStoreFocusMode(false)
    setIsPlotFocusMode(false)
    setSelectedStore(null)
    setUserSession(null)
    setIsUnlocked(false)
    setScene('LOCKED')
  }

  const nextPlot = findNextAvailablePlot(stores)

  return (
    <main className="w-screen h-screen relative overflow-hidden bg-slate-950 font-sans">
      {/* SCENE 1: THE LOCKED WINDOW LANDING PAGE */}
      {scene === 'LOCKED' && (
        <div className="w-full h-full relative">
          <StorefrontScene
            onUnlockClick={handleLockClick}
            isUnlocked={isUnlocked}
            isTransitioning={isTransitioning}
          />

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
          {/* Top Floating Navigation */}
          <FloatingNav
            stores={stores}
            selectedStore={selectedStore}
            onSelectStore={handleStoreSelect}
            onOpenConstruct={handleConstructNewStore}
            onResetCamera={handleResetCamera}
            userSession={userSession}
            onLogout={handleLogout}
            timeOfDay={timeOfDay}
            onToggleTimeOfDay={() => setTimeOfDay(t => t === 'day' ? 'night' : 'day')}
            graphicsQuality={graphicsQuality}
            onChangeGraphicsQuality={setGraphicsQuality}
            nextPlotIndex={nextPlot.plot_index + 1}
          />

          {/* REQUIREMENT 2: AFTER LOGIN - PRIMARY MARKETPLACE GAME PILL ACTION BUTTONS */}
          {showWelcomeOptions && !isStoreFocusMode && !isPlotFocusMode && (
            <GamePillButtons
              storeCount={stores.length}
              onExplore={handleExploreStores}
              onBuild={handleConstructNewStore}
              onDismiss={() => setShowWelcomeOptions(false)}
            />
          )}

          {/* CITY VIEW BUTTON: Appears when user is focused on a store OR on a construction plot */}
          {(isStoreFocusMode || isPlotFocusMode) && (
            <CityViewPill
              onCityView={handleReturnToCityView}
              onNextStore={stores.length > 1 && !isPlotFocusMode ? handleNextStore : undefined}
              currentStoreIndex={exploreIndex}
              totalStores={stores.length}
              storeName={selectedStore?.name}
              isPlotMode={isPlotFocusMode}
              plotIndex={nextPlot.plot_index + 1}
              onOpenBuild={() => setIsConstructOpen(true)}
            />
          )}

          {/* 3D Interactive Town */}
          <ErrorBoundary fallbackTitle="3D Metropolis Scene Warning">
            <MarketplaceScene
              stores={stores}
              selectedStore={selectedStore}
              onStoreSelect={handleStoreSelect}
              onHoverStore={setHoveredStore}
              onConstructClick={handleConstructNewStore}
              cameraTarget={cameraTarget}
              onCameraTargetReached={() => setCameraTarget(null)}
              onUserInteract={() => setCameraTarget(null)}
              onDeselectStore={() => setSelectedStore(null)}
              timeOfDay={timeOfDay}
              graphicsQuality={graphicsQuality}
              constructingStoreId={constructingStoreId}
            />
          </ErrorBoundary>

          {/* GTA 6 Corner Radar Minimap Guide */}
          <GtaMinimap
            stores={stores}
            selectedStore={selectedStore}
            onSelectStore={handleStoreSelect}
            onOpenConstruct={handleConstructNewStore}
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
          <ErrorBoundary fallbackTitle="Store Analytics Warning">
            <StoreAnalyticsModal
              store={selectedStore}
              isOpen={isAnalyticsOpen}
              onClose={() => {
                setIsAnalyticsOpen(false)
                setCameraTarget(null)
              }}
            />
          </ErrorBoundary>

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
