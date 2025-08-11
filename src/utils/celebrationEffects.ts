import { StatusType } from '../types/habit';

// Audio Context for sound effects
let audioContext: AudioContext | null = null;

const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Enhanced vibration patterns for different statuses (mobile only)
const vibratePattern = (pattern: number[]) => {
  try {
    console.log('vibratePattern called with:', pattern);
    console.log('Location:', location.href);
    console.log('Protocol:', location.protocol);
    console.log('Hostname:', location.hostname);
    console.log('isSecureContext:', window.isSecureContext);
    
    // Check if vibration is supported
    if (!('vibrate' in navigator)) {
      console.log('Vibration API not supported');
      return false;
    }

    // Allow vibration in secure contexts OR localhost (even HTTP)
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const isSecure = window.isSecureContext || location.protocol === 'https:';
    
    if (!isSecure && !isLocalhost) {
      console.log('Vibration requires secure context (HTTPS) or localhost');
      return false;
    }

    console.log('Attempting to vibrate with pattern:', pattern);
    
    // Try to vibrate
    const result = navigator.vibrate(pattern);
    console.log('Vibration triggered:', pattern, 'Result:', result);
    return result;
  } catch (error) {
    console.error('Vibration error:', error);
    return false;
  }
};

// Initialize vibration after user interaction (required on some Android devices)
let vibrationInitialized = false;

export const initializeVibration = () => {
  if (!vibrationInitialized && 'vibrate' in navigator) {
    try {
      // Try a very short vibration to "wake up" the API
      navigator.vibrate(1);
      vibrationInitialized = true;
      console.log('Vibration initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize vibration:', error);
      return false;
    }
  }
  return vibrationInitialized;
};

// Test vibration function for debugging
export const testVibration = () => {
  console.log('🔧 [DEBUG] Test wibracji rozpoczęty');
  
  // Zbierz informacje debugowania
  const hasVibrationAPI = 'vibrate' in navigator;
  const isSecureContext = window.isSecureContext;
  const protocol = location.protocol;
  const hostname = location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isChrome = /Chrome/i.test(navigator.userAgent);
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  
  console.log('📱 Środowisko: PWA=' + isPWA + ', Android=' + isAndroid + ', Chrome=' + isChrome);
  console.log('🌐 Lokalizacja: ' + location.href + ', Secure=' + isSecureContext);
  console.log('📳 Vibration API: dostępne=' + hasVibrationAPI);
  console.log('🔧 Vibration initialized:', vibrationInitialized);
  
  // Sprawdź dostępność API
  if (!hasVibrationAPI) {
    const errorMsg = '❌ Vibration API nie jest dostępne w tej przeglądarce';
    console.error(errorMsg);
    alert(errorMsg + '\n\nTwoja przeglądarka nie obsługuje wibracji.');
    return false;
  }
  
  // NAJPROSTSZY TEST - natychmiastowe wykonanie
  try {
    console.log('📳 PROSTY TEST: Bezpośrednie wywołanie navigator.vibrate(1000)...');
    
    // Najpierw spróbuj zatrzymać wszystkie wibracje
    navigator.vibrate(0);
    console.log('📳 Zatrzymano poprzednie wibracje');
    
    // Teraz spróbuj długiej wibracji (1 sekunda)
    const result = navigator.vibrate(1000);
    console.log('📳 navigator.vibrate(1000) wynik:', result);
    
    if (result) {
      console.log('✅ Wibracja powinna być aktywna przez 1 sekundę');
      alert('✅ Test wibracji uruchomiony!\n\nPowinieneś czuć wibrację przez 1 sekundę.\n\nJeśli nie czujesz:\n• Sprawdź ustawienia wibracji w telefonie\n• Sprawdź czy telefon nie jest w trybie cichym\n• Spróbuj funkcji testVibrateConsole() w konsoli');
      return true;
    } else {
      const errorMsg = '⚠️ navigator.vibrate() zwrócił false';
      console.warn(errorMsg);
      alert(errorMsg + '\n\nNavigator.vibrate() zwrócił false.\nTo może oznaczać:\n• Brak uprawnień\n• Tryb cichy\n• Wyłączona wibracja w ustawieniach\n• Blokada przez przeglądarkę\n\nSpróbuj testVibrateConsole() w konsoli');
      return false;
    }
  } catch (error) {
    const errorMsg = '❌ Błąd podczas wykonywania wibracji: ' + error;
    console.error(errorMsg);
    alert(errorMsg + '\n\nWystąpił błąd JavaScript:\n' + error.message);
    return false;
  }
};

export const triggerVibration = (status: StatusType) => {
  console.log('Triggering vibration for status:', status);
  
  // Initialize vibration if not already done
  initializeVibration();
  
  switch (status) {
    case 'completed':
      // Triumphant vibration - short burst, pause, longer burst
      return vibratePattern([100, 50, 150, 50, 200]);
    case 'partial':
      // Gentle encouraging vibration - two short pulses
      return vibratePattern([50, 50, 50]);
    case 'failed':
      // Sympathetic vibration - one longer gentle pulse
      return vibratePattern([100]);
    case 'not-applicable':
      // Very light feedback
      return vibratePattern([30]);
    default:
      return false;
  }
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

// Celebration sounds - more melodic and engaging like Duolingo
export const playSuccessSound = () => {
  // Duolingo-style success melody - ascending major scale with harmony
  setTimeout(() => playChord([523.25, 659.25, 783.99], 0.2, 0.08), 0); // C major
  setTimeout(() => playChord([587.33, 739.99, 880.00], 0.2, 0.08), 120); // D major  
  setTimeout(() => playChord([659.25, 830.61, 987.77], 0.2, 0.08), 240); // E major
  setTimeout(() => playChord([698.46, 880.00, 1046.50], 0.3, 0.1), 360); // F major - triumphant finish
  
  // Add a bell-like overtone for extra sparkle
  setTimeout(() => playTone(1568, 0.4, 'sine', 0.04), 360);
};

export const playPartialSound = () => {
  // Encouraging but not complete - gentle ascending melody
  setTimeout(() => playTone(523.25, 0.15, 'sine', 0.06), 0); // C
  setTimeout(() => playTone(659.25, 0.15, 'sine', 0.06), 80); // E
  setTimeout(() => playTone(783.99, 0.2, 'sine', 0.07), 160); // G
  setTimeout(() => playTone(659.25, 0.25, 'sine', 0.05), 280); // Back to E - unresolved
};

export const playFailSound = () => {
  // Gentle, supportive descending melody - not harsh
  setTimeout(() => playTone(523.25, 0.3, 'sine', 0.05), 0); // C
  setTimeout(() => playTone(466.16, 0.3, 'sine', 0.05), 150); // Bb
  setTimeout(() => playTone(415.30, 0.4, 'sine', 0.05), 300); // Ab
  
  // Add a soft, warm undertone
  setTimeout(() => playTone(207.65, 0.6, 'sine', 0.03), 0); // Low C
};

export const playNeutralSound = () => {
  // Simple but pleasant acknowledgment
  setTimeout(() => playTone(440, 0.1, 'sine', 0.04), 0); // A
  setTimeout(() => playTone(523.25, 0.15, 'sine', 0.03), 80); // C
};

// Enhanced visual effects inspired by Duolingo
export const createConfetti = (element: HTMLElement) => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#a8e6cf', '#ffd93d'];
  
  for (let i = 0; i < 40; i++) {
    const confetti = document.createElement('div');
    const size = Math.random() * 6 + 4; // 4-10px
    const isCircle = Math.random() > 0.5;
    
    confetti.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${isCircle ? '50%' : '2px'};
      pointer-events: none;
      z-index: 1000;
      animation: confetti-fall-enhanced ${1.5 + Math.random() * 1}s ease-out forwards;
      transform-origin: center;
    `;
    
    const rect = element.getBoundingClientRect();
    confetti.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 120}px`;
    confetti.style.top = `${rect.top + rect.height / 2}px`;
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
      if (confetti.parentNode) {
        confetti.parentNode.removeChild(confetti);
      }
    }, 2500);
  }
};

export const createSparkles = (element: HTMLElement) => {
  const sparkles = ['✨', '⭐', '💫', '🌟', '⚡', '💥'];
  
  for (let i = 0; i < 12; i++) {
    const sparkle = document.createElement('div');
    sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
    sparkle.style.cssText = `
      position: absolute;
      font-size: ${16 + Math.random() * 8}px;
      pointer-events: none;
      z-index: 1000;
      animation: sparkle-float-enhanced ${1.2 + Math.random() * 0.6}s ease-out forwards;
      filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8));
    `;
    
    const rect = element.getBoundingClientRect();
    sparkle.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 100}px`;
    sparkle.style.top = `${rect.top + rect.height / 2 + (Math.random() - 0.5) * 50}px`;
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
      if (sparkle.parentNode) {
        sparkle.parentNode.removeChild(sparkle);
      }
    }, 1800);
  }
};

export const createFireEffect = (element: HTMLElement) => {
  // Special fire effect for streaks
  const fireEmojis = ['🔥', '🌟', '💥', '⚡'];
  
  for (let i = 0; i < 8; i++) {
    const fire = document.createElement('div');
    fire.textContent = fireEmojis[Math.floor(Math.random() * fireEmojis.length)];
    fire.style.cssText = `
      position: absolute;
      font-size: ${20 + Math.random() * 10}px;
      pointer-events: none;
      z-index: 1000;
      animation: fire-burst ${0.8 + Math.random() * 0.4}s ease-out forwards;
      filter: drop-shadow(0 0 5px rgba(255, 165, 0, 0.8));
    `;
    
    const rect = element.getBoundingClientRect();
    const angle = (i / 8) * Math.PI * 2;
    const radius = 40 + Math.random() * 20;
    
    fire.style.left = `${rect.left + rect.width / 2 + Math.cos(angle) * radius}px`;
    fire.style.top = `${rect.top + rect.height / 2 + Math.sin(angle) * radius}px`;
    
    document.body.appendChild(fire);
    
    setTimeout(() => {
      if (fire.parentNode) {
        fire.parentNode.removeChild(fire);
      }
    }, 1200);
  }
};

export const createBounceEffect = (element: HTMLElement) => {
  // Duolingo-style bounce effect
  element.style.animation = 'duolingo-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
  setTimeout(() => {
    element.style.animation = '';
  }, 600);
};

export const createRippleEffect = (element: HTMLElement, color: string) => {
  const ripple = document.createElement('div');
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: ${color};
    pointer-events: none;
    z-index: 999;
    animation: ripple-effect 0.8s ease-out forwards;
  `;
  
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${rect.left + rect.width / 2 - size / 2}px`;
  ripple.style.top = `${rect.top + rect.height / 2 - size / 2}px`;
  
  document.body.appendChild(ripple);
  
  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
  }, 800);
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
  // Enhanced button animation with bounce
  createBounceEffect(element);
  createRippleEffect(element, color);
  
  element.style.animation = `pulse-${color} 0.6s ease-out, duolingo-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
  setTimeout(() => {
    element.style.animation = '';
  }, 600);
};

// Main celebration function - enhanced with vibrations and better effects
export const triggerCelebration = (status: StatusType, buttonElement: HTMLElement) => {
  // Trigger vibration first for immediate feedback
  triggerVibration(status);
  
  switch (status) {
    case 'completed':
      playSuccessSound();
      createConfetti(buttonElement);
      createSparkles(buttonElement);
      createFireEffect(buttonElement);
      addButtonPulse(buttonElement, 'success');
      createRippleEffect(buttonElement, 'rgba(34, 197, 94, 0.3)');
      break;
    case 'partial':
      playPartialSound();
      createSparkles(buttonElement);
      addButtonPulse(buttonElement, 'partial');
      createRippleEffect(buttonElement, 'rgba(251, 191, 36, 0.3)');
      break;
    case 'failed':
      playFailSound();
      createSadEffect(buttonElement);
      addButtonPulse(buttonElement, 'fail');
      createRippleEffect(buttonElement, 'rgba(239, 68, 68, 0.2)');
      break;
    case 'not-applicable':
      playNeutralSound();
      addButtonPulse(buttonElement, 'neutral');
      createRippleEffect(buttonElement, 'rgba(156, 163, 175, 0.2)');
      break;
  }
};

// Enhanced streak celebration for milestones
export const celebrateStreak = (streakCount: number, element: HTMLElement) => {
  if (streakCount > 0 && streakCount % 7 === 0) {
    // Weekly milestone - extra spectacular celebration
    setTimeout(() => {
      // Triple vibration for major milestone
      vibratePattern([100, 50, 100, 50, 150]);
      
      // Enhanced sound sequence
      playSuccessSound();
      setTimeout(() => playSuccessSound(), 400); // Echo effect
      
      // Multiple visual effects
      createConfetti(element);
      createFireEffect(element);
      createSparkles(element);
      
      // Extra confetti burst
      setTimeout(() => createConfetti(element), 300);
      
      // Show enhanced streak message with animation
      const message = document.createElement('div');
      message.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 24px; margin-bottom: 8px;">🔥🔥🔥</div>
          <div style="font-size: 18px; font-weight: bold;">${streakCount} dni z rzędu!</div>
          <div style="font-size: 14px; opacity: 0.9; margin-top: 4px;">Niesamowite!</div>
        </div>
      `;
      message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 24px 32px;
        border-radius: 20px;
        z-index: 10000;
        box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        animation: streak-celebration-enhanced 4s ease-out forwards;
        border: 3px solid rgba(255, 255, 255, 0.3);
      `;
      
      document.body.appendChild(message);
      
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 4000);
    }, 500);
  } else if (streakCount > 0 && streakCount % 3 === 0) {
    // Mini celebration for every 3 days
    setTimeout(() => {
      vibratePattern([50, 30, 50]);
      createFireEffect(element);
      
      const miniMessage = document.createElement('div');
      miniMessage.textContent = `🔥 ${streakCount} dni!`;
      miniMessage.style.cssText = `
        position: absolute;
        font-size: 16px;
        font-weight: bold;
        color: #ff6b35;
        pointer-events: none;
        z-index: 1000;
        animation: mini-celebration 2s ease-out forwards;
        text-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
      `;
      
      const rect = element.getBoundingClientRect();
      miniMessage.style.left = `${rect.left + rect.width / 2}px`;
      miniMessage.style.top = `${rect.top - 30}px`;
      miniMessage.style.transform = 'translateX(-50%)';
      
      document.body.appendChild(miniMessage);
      
      setTimeout(() => {
        if (miniMessage.parentNode) {
          miniMessage.parentNode.removeChild(miniMessage);
        }
      }, 2000);
    }, 300);
  }
};