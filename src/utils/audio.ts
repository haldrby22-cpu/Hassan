/**
 * Web Audio API based Synthesizer for high-quality, lightweight in-app notifications.
 * Bypasses CORS and network requirements since it synthesizes tones locally.
 */

export function playChimeSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    
    // Resume audio context if suspended (browser security constraints)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const now = ctx.currentTime;
    
    const playTone = (freq: number, start: number, dur: number, type: OscillatorType = 'sine') => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      
      gainNode.gain.setValueAtTime(0, start);
      gainNode.gain.linearRampToValueAtTime(0.2, start + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(start);
      osc.stop(start + dur);
    };

    // Beautiful 3-tone melodic chime: C5 -> E5 -> G5
    playTone(523.25, now, 0.3, 'sine');       // C5
    playTone(659.25, now + 0.15, 0.3, 'sine'); // E5
    playTone(783.99, now + 0.3, 0.5, 'sine');  // G5
  } catch (err) {
    console.error('Failed to play chime sound:', err);
  }
}

export function playOrderAlertSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    
    // Resume audio context if suspended
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const now = ctx.currentTime;
    
    const playTone = (freq: number, start: number, dur: number, type: OscillatorType = 'triangle') => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      
      gainNode.gain.setValueAtTime(0, start);
      gainNode.gain.linearRampToValueAtTime(0.25, start + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(start);
      osc.stop(start + dur);
    };

    // Fast attention-getting bell alert: "Beep-Beep! Beep-Beep! Ring!"
    playTone(880, now, 0.12, 'sine');
    playTone(880, now + 0.1, 0.12, 'sine');
    
    playTone(987.77, now + 0.25, 0.12, 'sine');
    playTone(987.77, now + 0.35, 0.12, 'sine');
    
    playTone(1174.66, now + 0.5, 0.45, 'triangle');
  } catch (err) {
    console.error('Failed to play order alert sound:', err);
  }
}
