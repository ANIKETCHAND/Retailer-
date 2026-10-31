/**
 * RetailVision - Synthesized Luxury Audio System
 * Uses standard Web Audio API to produce crisp, tactile sound effects
 * for smart lock interaction, biometric chime, and door motion without external mp3 files.
 */

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export function playLockHoverSound(muted: boolean = false) {
  if (muted) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(1400, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1900, ctx.currentTime + 0.04)

    gain.gain.setValueAtTime(0.03, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.045)
  } catch {}
}

export function playLockSuccessSound(muted: boolean = false) {
  if (muted) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime

    // 1. Mechanical Bolt Release Click
    const clickOsc = ctx.createOscillator()
    const clickGain = ctx.createGain()
    clickOsc.type = 'triangle'
    clickOsc.frequency.setValueAtTime(260, now)
    clickOsc.frequency.exponentialRampToValueAtTime(50, now + 0.08)
    clickGain.gain.setValueAtTime(0.18, now)
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.085)
    clickOsc.connect(clickGain)
    clickGain.connect(ctx.destination)
    clickOsc.start(now)
    clickOsc.stop(now + 0.085)

    // 2. High-Tech Luxury Biometric Chime (C6 -> E6 -> G6)
    const notes = [1046.5, 1318.5, 1567.98]
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const noteTime = now + 0.05 + idx * 0.07

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, noteTime)

      gain.gain.setValueAtTime(0, noteTime)
      gain.gain.linearRampToValueAtTime(0.08, noteTime + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.32)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(noteTime)
      osc.stop(noteTime + 0.33)
    })
  } catch {}
}
