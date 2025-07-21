// Simple sound generator using Web Audio API
export class SoundGenerator {
  private audioContext: AudioContext | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext) return null
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
    
    return this.audioContext
  }

  // Generate a smooth laser "piu" sound
  async generateTargetHitSound(volume: number = 0.5) {
    // Extra safety check - don't generate sound if volume is 0
    if (volume <= 0) return
    
    const context = await this.ensureAudioContext()
    if (!context) return

    const now = context.currentTime
    
    // Main laser oscillator - smooth sine wave
    const laserOsc = context.createOscillator()
    const laserGain = context.createGain()
    const laserFilter = context.createBiquadFilter()
    
    laserOsc.connect(laserFilter)
    laserFilter.connect(laserGain)
    laserGain.connect(context.destination)
    
    // Sine wave for smooth, pleasant tone
    laserOsc.type = 'sine'
    // Gentle frequency sweep for "piu" effect
    laserOsc.frequency.setValueAtTime(800, now)
    laserOsc.frequency.exponentialRampToValueAtTime(400, now + 0.15)
    
    // Low-pass filter for warmth
    laserFilter.type = 'lowpass'
    laserFilter.frequency.setValueAtTime(1200, now)
    laserFilter.frequency.exponentialRampToValueAtTime(600, now + 0.15)
    laserFilter.Q.setValueAtTime(1, now)
    
    // Smooth envelope - gentle attack and decay
    laserGain.gain.setValueAtTime(0, now)
    laserGain.gain.linearRampToValueAtTime(volume * 0.7, now + 0.02)
    laserGain.gain.linearRampToValueAtTime(volume * 0.5, now + 0.08)
    laserGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
    
    // Add subtle harmonic for richness
    const harmonicOsc = context.createOscillator()
    const harmonicGain = context.createGain()
    
    harmonicOsc.connect(harmonicGain)
    harmonicGain.connect(context.destination)
    
    harmonicOsc.type = 'triangle'
    harmonicOsc.frequency.setValueAtTime(1600, now) // Octave higher
    harmonicOsc.frequency.exponentialRampToValueAtTime(800, now + 0.15)
    
    // Subtle harmonic level
    harmonicGain.gain.setValueAtTime(0, now)
    harmonicGain.gain.linearRampToValueAtTime(volume * 0.15, now + 0.03)
    harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
    
    // Start both oscillators
    laserOsc.start(now)
    laserOsc.stop(now + 0.25)
    harmonicOsc.start(now)
    harmonicOsc.stop(now + 0.15)
  }

  // Generate a target miss sound (disappointing "whoosh")
  async generateTargetMissSound(volume: number = 0.5) {
    // Extra safety check - don't generate sound if volume is 0
    if (volume <= 0) return
    
    const context = await this.ensureAudioContext()
    if (!context) return

    const now = context.currentTime
    
    // Create a "whoosh" miss sound with noise and low frequency
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    const filter = context.createBiquadFilter()
    
    oscillator.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(context.destination)
    
    // Use sawtooth for harsher sound
    oscillator.type = 'sawtooth'
    // Low frequency sweep downward for disappointment
    oscillator.frequency.setValueAtTime(200, now)
    oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.3)
    
    // Low-pass filter for muffled effect
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(400, now)
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.3)
    filter.Q.setValueAtTime(0.5, now)
    
    // Quick fade in, slow fade out
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume * 0.4, now + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
    
    oscillator.start(now)
    oscillator.stop(now + 0.4)
  }

  // Generate a positive balance update sound (coins/money sound)
  async generateTokenGainSound(volume: number = 0.5) {
    // Extra safety check - don't generate sound if volume is 0
    if (volume <= 0) return
    
    const context = await this.ensureAudioContext()
    if (!context) return

    // Create a "coin" sound with multiple frequencies
    const frequencies = [523, 659, 784] // C5, E5, G5 (major chord)
    
    frequencies.forEach((freq, index) => {
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(context.destination)
      
      oscillator.type = 'triangle'
      oscillator.frequency.setValueAtTime(freq, context.currentTime)
      
      const delay = index * 0.05
      const startTime = context.currentTime + delay
      
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.3, startTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4)
      
      oscillator.start(startTime)
      oscillator.stop(startTime + 0.4)
    })
  }

  // Generate a negative balance update sound (loss/penalty sound)
  async generateTokenLossSound(volume: number = 0.5) {
    // Extra safety check - don't generate sound if volume is 0
    if (volume <= 0) return
    
    const context = await this.ensureAudioContext()
    if (!context) return

    const now = context.currentTime
    
    // Create a "penalty" sound with dissonant frequencies
    const frequencies = [220, 233, 196] // Dissonant minor intervals for negative feeling
    
    frequencies.forEach((freq, index) => {
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()
      const filter = context.createBiquadFilter()
      
      oscillator.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(context.destination)
      
      oscillator.type = 'triangle'
      oscillator.frequency.setValueAtTime(freq, now)
      oscillator.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.5) // Descending
      
      // Low-pass filter for muffled, sad effect
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(800, now)
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.5)
      filter.Q.setValueAtTime(1, now)
      
      const delay = index * 0.08
      const startTime = now + delay
      
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.2, startTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6)
      
      oscillator.start(startTime)
      oscillator.stop(startTime + 0.6)
    })
  }

  // Generate a simple button click sound
  async generateClickSound(volume: number = 0.3) {
    // Extra safety check - don't generate sound if volume is 0
    if (volume <= 0) return
    
    const context = await this.ensureAudioContext()
    if (!context) return

    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    
    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(800, context.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(400, context.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0, context.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.1)
    
    oscillator.start(context.currentTime)
    oscillator.stop(context.currentTime + 0.1)
  }
}

// Create a singleton instance
export const soundGenerator = new SoundGenerator() 