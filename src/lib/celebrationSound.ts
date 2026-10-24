// Synthesized celebration sound using Web Audio API
export const playCelebrationSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Create multiple notes for a cheerful fanfare
  const notes = [
    { freq: 523.25, start: 0, duration: 0.15 },     // C5
    { freq: 659.25, start: 0.1, duration: 0.15 },   // E5
    { freq: 783.99, start: 0.2, duration: 0.15 },   // G5
    { freq: 1046.50, start: 0.3, duration: 0.4 },   // C6 (hold)
  ];

  notes.forEach(({ freq, start, duration }) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + start);
    
    // Envelope for pleasant sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + start);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + start + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + start + duration);
    
    oscillator.start(audioContext.currentTime + start);
    oscillator.stop(audioContext.currentTime + start + duration + 0.1);
  });

  // Add a shimmer/sparkle effect
  for (let i = 0; i < 8; i++) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.type = 'sine';
    const baseFreq = 2000 + Math.random() * 2000;
    osc.frequency.setValueAtTime(baseFreq, audioContext.currentTime + 0.4 + i * 0.05);
    
    gain.gain.setValueAtTime(0, audioContext.currentTime + 0.4 + i * 0.05);
    gain.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.42 + i * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.55 + i * 0.05);
    
    osc.start(audioContext.currentTime + 0.4 + i * 0.05);
    osc.stop(audioContext.currentTime + 0.6 + i * 0.05);
  }
};

// Optional: A simpler "ding" sound for smaller achievements
export const playSuccessSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(1760, audioContext.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
};
