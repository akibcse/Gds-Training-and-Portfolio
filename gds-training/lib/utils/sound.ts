// Web Audio API notification chime generator (no external audio files needed)

export function playNotificationChime() {
    if (typeof window === "undefined") return;

    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        if (ctx.state === "suspended") {
            ctx.resume();
        }

        const now = ctx.currentTime;

        // Tone 1: E5 (659.25 Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(659.25, now);
        gain1.gain.setValueAtTime(0.15, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.3);

        // Tone 2: A5 (880 Hz) slightly delayed for a pleasant chime
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880, now + 0.1);
        gain2.gain.setValueAtTime(0.2, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.5);
    } catch (e) {
        console.warn("Failed to play notification chime:", e);
    }
}
