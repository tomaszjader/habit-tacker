import { StatusType } from '../types/habit';

// Audio Context for sound effects
let audioContext: AudioContext | null = null;

const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Sound generation functions
const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) => {
  const ctx = initAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  oscillator.type = type;
  
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
};

const playChord = (frequencies: number[], duration: number, volume: number = 0.05) => {
  frequencies.forEach(freq => playTone(freq, duration, 'sine', volume));
};

// Celebration sounds
export const playSuccessSound = () => {
  // Triumphant fanfare - major chord progression
  setTimeout(() => playChord([523.25, 659.25, 783.99], 0.3), 0); // C major
  setTimeout(() => playChord([587.33, 739.99, 880.00], 0.3), 150); // D major
  setTimeout(() => playChord([659.25, 830.61, 987.77], 0.5), 300); // E major
};

export const playPartialSound = () => {
  // Gentle encouraging sound
  setTimeout(() => playTone(523.25, 0.2, 'sine', 0.08), 0); // C
  setTimeout(() => playTone(659.25, 0.2, 'sine', 0.08), 100); // E
  setTimeout(() => playTone(783.99, 0.3, 'sine', 0.08), 200); // G
};

export const playFailSound = () => {
  // Sad but not harsh sound
  setTimeout(() => playTone(349.23, 0.4, 'sine', 0.06), 0); // F
  setTimeout(() => playTone(293.66, 0.4, 'sine', 0.06), 200); // D
  setTimeout(() => playTone(261.63, 0.6, 'sine', 0.06), 400); // C
};

export const playNeutralSound = () => {
  // Simple neutral beep
  playTone(440, 0.1, 'sine', 0.05); // A
};

// Visual effects
export const createConfetti = (element: HTMLElement) => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
  
  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: absolute;
      width: 8px;
      height: 8px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      pointer-events: none;
      z-index: 1000;
      animation: confetti-fall 2s ease-out forwards;
    `;
    
    const rect = element.getBoundingClientRect();
    confetti.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 100}px`;
    confetti.style.top = `${rect.top + rect.height / 2}px`;
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
      if (confetti.parentNode) {
        confetti.parentNode.removeChild(confetti);
      }
    }, 2000);
  }
};

export const createSparkles = (element: HTMLElement) => {
  const sparkles = ['✨', '⭐', '💫', '🌟'];
  
  for (let i = 0; i < 8; i++) {
    const sparkle = document.createElement('div');
    sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
    sparkle.style.cssText = `
      position: absolute;
      font-size: 20px;
      pointer-events: none;
      z-index: 1000;
      animation: sparkle-float 1.5s ease-out forwards;
    `;
    
    const rect = element.getBoundingClientRect();
    sparkle.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 80}px`;
    sparkle.style.top = `${rect.top + rect.height / 2 + (Math.random() - 0.5) * 40}px`;
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
      if (sparkle.parentNode) {
        sparkle.parentNode.removeChild(sparkle);
      }
    }, 1500);
  }
};

export const createSadEffect = (element: HTMLElement) => {
  const sadEmojis = ['😔', '💧', '😢'];
  
  for (let i = 0; i < 3; i++) {
    const sad = document.createElement('div');
    sad.textContent = sadEmojis[Math.floor(Math.random() * sadEmojis.length)];
    sad.style.cssText = `
      position: absolute;
      font-size: 16px;
      pointer-events: none;
      z-index: 1000;
      animation: sad-drop 2s ease-out forwards;
      opacity: 0.7;
    `;
    
    const rect = element.getBoundingClientRect();
    sad.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 40}px`;
    sad.style.top = `${rect.top + rect.height / 2}px`;
    
    document.body.appendChild(sad);
    
    setTimeout(() => {
      if (sad.parentNode) {
        sad.parentNode.removeChild(sad);
      }
    }, 2000);
  }
};

export const addButtonPulse = (element: HTMLElement, color: string) => {
  element.style.animation = `pulse-${color} 0.6s ease-out`;
  setTimeout(() => {
    element.style.animation = '';
  }, 600);
};

// Main celebration function
export const triggerCelebration = (status: StatusType, buttonElement: HTMLElement) => {
  switch (status) {
    case 'completed':
      playSuccessSound();
      createConfetti(buttonElement);
      createSparkles(buttonElement);
      addButtonPulse(buttonElement, 'success');
      break;
    case 'partial':
      playPartialSound();
      createSparkles(buttonElement);
      addButtonPulse(buttonElement, 'partial');
      break;
    case 'failed':
      playFailSound();
      createSadEffect(buttonElement);
      addButtonPulse(buttonElement, 'fail');
      break;
    case 'not-applicable':
      playNeutralSound();
      addButtonPulse(buttonElement, 'neutral');
      break;
  }
};

// Streak celebration for milestones
export const celebrateStreak = (streakCount: number, element: HTMLElement) => {
  if (streakCount > 0 && streakCount % 7 === 0) {
    // Weekly milestone
    setTimeout(() => {
      playSuccessSound();
      createConfetti(element);
      
      // Show streak message
      const message = document.createElement('div');
      message.textContent = `🔥 ${streakCount} dni z rzędu! 🔥`;
      message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        font-size: 18px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        animation: streak-celebration 3s ease-out forwards;
      `;
      
      document.body.appendChild(message);
      
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 3000);
    }, 500);
  }
};