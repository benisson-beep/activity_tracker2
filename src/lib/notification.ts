/**
 * Notification and Audio Synthesizer Engine for Chronicle
 * Zero external files, 100% reliable Web Audio API + HTML5 Notification API
 */

export function playSessionCompleteChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Harmonic 3-note melodic chime (C5 -> E5 -> G5)
    const notes = [523.25, 659.25, 783.99];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      // Smooth attack and gentle exponential decay
      gain.gain.setValueAtTime(0.001, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.25, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.3);
    });
  } catch (e) {
    console.error('Audio chime playback failed:', e);
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return await Notification.requestPermission();
}

export function sendFocusCompleteNotification(sessionTitle: string, durationOrMessage: number | string = 25) {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    const title = '🎯 Focus Session Complete!';
    const body = typeof durationOrMessage === 'number'
      ? `Great work! You finished ${durationOrMessage} minutes of "${sessionTitle || 'Focus Activity'}". Click to save to your history.`
      : durationOrMessage;
    
    try {
      const notification = new Notification(title, {
        body,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2310b981"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
        tag: 'chronicle-focus-complete',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (e) {
      console.error('Failed to dispatch native notification:', e);
    }
  }
}
