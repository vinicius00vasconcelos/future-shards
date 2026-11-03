// ============================================================================
// FUTURE SHARDS — SYNTHESIZED 16-BIT WEB AUDIO ENGINE (WITH FOOTSTEP SFX)
// ============================================================================

let audioCtx = null;
let isMuted = false;

function playSfx(type) {
  if (isMuted) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === "collect") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.09);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === "scan") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.setValueAtTime(780, now + 0.06);
      osc.frequency.setValueAtTime(1040, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === "craft" || type === "build") {
      osc.type = "square";
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.setValueAtTime(390, now + 0.07);
      osc.frequency.setValueAtTime(520, now + 0.14);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.start(now);
      osc.stop(now + 0.24);
    } else if (type === "tech") {
      osc.type = "triangle";
      [440, 554, 659, 880].forEach((freq, i) => {
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
      });
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.start(now);
      osc.stop(now + 0.32);
    } else if (type === "step_grass") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(135 + Math.random() * 25, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.045);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "step_wood") {
      osc.type = "square";
      osc.frequency.setValueAtTime(190 + Math.random() * 30, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.04);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      osc.start(now);
      osc.stop(now + 0.045);
    } else if (type === "step_water") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(240 + Math.random() * 60, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.06);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
      osc.start(now);
      osc.stop(now + 0.065);
    }
  } catch (e) {}
}
