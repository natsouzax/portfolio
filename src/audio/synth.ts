export type SoundEffect =
  | "hover"
  | "push"
  | "crash"
  | "radar"
  | "check"
  | "correct"
  | "confirm"
  | "calculations"
  | "binary"
  | "whoosh"
  | "softWhoosh"
  | "television"
  | "futuristic"
  | "powerOn"
  | "powerOff"
  | "frameTransition"
  | "scroll";

export type SoundOptions = {
  direction?: -1 | 1;
  intensity?: number;
  step?: number;
};

type ToneOptions = {
  frequency: number;
  endFrequency?: number;
  duration: number;
  gain: number;
  delay?: number;
  type?: OscillatorType;
};

type NoiseOptions = {
  duration: number;
  frequency: number;
  endFrequency?: number;
  gain: number;
  delay?: number;
  type?: BiquadFilterType;
  q?: number;
};

type SoundSample =
  | "roboticGlitch"
  | "calculations"
  | "futuristicNoises"
  | "uiClick"
  | "binaryInterface"
  | "cinematicImpact"
  | "sciFiWhoosh";

type SampleOptions = {
  gain: number;
  offset?: number;
  duration?: number;
  delay?: number;
  playbackRate?: number;
  fadeIn?: number;
  fadeOut?: number;
};

const sampleUrls: Record<SoundSample, string> = {
  roboticGlitch: "/audio/sfx/robotic-glitch.mp3",
  calculations: "/audio/sfx/calculations.mp3",
  futuristicNoises: "/audio/sfx/futuristic-noises.mp3",
  uiClick: "/audio/sfx/ui-click.mp3",
  binaryInterface: "/audio/sfx/binary-interface.mp3",
  cinematicImpact: "/audio/sfx/cinematic-impact.mp3",
  sciFiWhoosh: "/audio/sfx/sci-fi-whoosh.mp3",
};

export class SynthSoundEngine {
  private readonly context: AudioContext;
  private readonly output: GainNode;
  private readonly samples = new Map<SoundSample, AudioBuffer>();
  private preloadPromise: Promise<void> | null = null;

  constructor() {
    this.context = new AudioContext({ latencyHint: "interactive" });

    const compressor = this.context.createDynamicsCompressor();
    compressor.threshold.value = -22;
    compressor.knee.value = 16;
    compressor.ratio.value = 8;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.18;

    this.output = this.context.createGain();
    this.output.gain.value = 0.2;
    this.output.connect(compressor);
    compressor.connect(this.context.destination);
  }

  async unlock() {
    if (this.context.state === "suspended") {
      await this.context.resume();
    }
  }

  preloadSamples() {
    if (this.preloadPromise) return this.preloadPromise;

    this.preloadPromise = Promise.allSettled(
      (Object.entries(sampleUrls) as Array<[SoundSample, string]>).map(
        async ([sample, url]) => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Unable to load sound sample: ${url}`);
          }

          const encodedAudio = await response.arrayBuffer();
          const decodedAudio = await this.context.decodeAudioData(encodedAudio);
          this.samples.set(sample, decodedAudio);
        },
      ),
    ).then(() => undefined);

    return this.preloadPromise;
  }

  play(effect: SoundEffect, options: SoundOptions = {}) {
    if (this.context.state !== "running") return;

    const intensity = Math.max(0.35, Math.min(options.intensity ?? 1, 1.5));

    switch (effect) {
      case "hover":
        this.tone({
          frequency: 1120,
          endFrequency: 760,
          duration: 0.026,
          gain: 0.026,
          type: "square",
        });
        break;
      case "push":
        if (
          this.sample("uiClick", {
            gain: 0.24 * intensity,
            duration: 0.45,
            fadeOut: 0.025,
          })
        ) {
          break;
        }
        this.tone({
          frequency: 880,
          endFrequency: 410,
          duration: 0.052,
          gain: 0.046 * intensity,
          type: "square",
        });
        this.noise({
          duration: 0.044,
          frequency: 2600,
          endFrequency: 720,
          gain: 0.052 * intensity,
          type: "bandpass",
          q: 2.2,
        });
        break;
      case "crash":
        if (
          !this.sample("cinematicImpact", {
            gain: 0.18 * intensity,
            duration: 1.65,
            playbackRate: 1.04,
            fadeOut: 0.32,
          })
        ) {
          this.tone({
            frequency: 1380,
            endFrequency: 92,
            duration: 0.17,
            gain: 0.066 * intensity,
            type: "sawtooth",
          });
          this.noise({
            duration: 0.19,
            frequency: 6200,
            endFrequency: 540,
            gain: 0.13 * intensity,
            type: "bandpass",
            q: 1.1,
          });
        }
        [0.025, 0.064, 0.102].forEach((delay, index) => {
          this.noise({
            duration: 0.018,
            frequency: 7200 - index * 1100,
            gain: 0.065 * intensity,
            delay,
            type: "highpass",
          });
        });
        break;
      case "radar":
        this.noise({
          duration: 0.14,
          frequency: 480,
          endFrequency: 3900,
          gain: 0.075 * intensity,
          type: "bandpass",
          q: 4.2,
        });
        this.tone({
          frequency: 190,
          endFrequency: 1280,
          duration: 0.12,
          gain: 0.025 * intensity,
          type: "sawtooth",
        });
        break;
      case "check":
        this.tone({
          frequency: 1760,
          endFrequency: 2140,
          duration: 0.085,
          gain: 0.026 * intensity,
          type: "triangle",
        });
        break;
      case "correct":
        this.tone({
          frequency: 1260,
          endFrequency: 1460,
          duration: 0.075,
          gain: 0.021 * intensity,
          type: "triangle",
        });
        this.tone({
          frequency: 1780,
          endFrequency: 2040,
          duration: 0.11,
          gain: 0.028 * intensity,
          delay: 0.07,
          type: "triangle",
        });
        break;
      case "confirm":
        this.sample("uiClick", {
          gain: 0.16 * intensity,
          duration: 0.32,
          playbackRate: 1.12,
          fadeIn: 0.002,
          fadeOut: 0.04,
        });
        this.noise({
          duration: 0.026,
          frequency: 3600,
          endFrequency: 6200,
          gain: 0.035 * intensity,
          delay: 0.035,
          type: "highpass",
          q: 2.4,
        });
        this.tone({
          frequency: 1420,
          endFrequency: 1660,
          duration: 0.105,
          gain: 0.027 * intensity,
          delay: 0.055,
          type: "triangle",
        });
        break;
      case "calculations":
        if (
          !this.sample("calculations", {
            gain: 0.12 * intensity,
            offset: ((options.step ?? 0) % 6) * 2.15,
            duration: 1.05,
            playbackRate: 1.02,
            fadeOut: 0.16,
          })
        ) {
          this.play("radar", { intensity: intensity * 0.8 });
        }
        break;
      case "binary":
        if (
          !this.sample("binaryInterface", {
            gain: 0.1 * intensity,
            offset: ((options.step ?? 0) % 20) * 4.15,
            duration: 0.72,
            playbackRate: options.direction && options.direction < 0 ? 0.92 : 1.04,
            fadeOut: 0.1,
          })
        ) {
          this.play("radar", { intensity: intensity * 0.62 });
        }
        break;
      case "whoosh":
        if (
          !this.sample("sciFiWhoosh", {
            gain: 0.14 * intensity,
            duration: 1.35,
            playbackRate: options.direction && options.direction < 0 ? 0.9 : 1.04,
            fadeOut: 0.22,
          })
        ) {
          this.play("radar", { intensity: intensity * 0.58 });
        }
        break;
      case "softWhoosh":
        this.noise({
          duration: 0.16,
          frequency: 820,
          endFrequency: 3600,
          gain: 0.042 * intensity,
          type: "bandpass",
          q: 1.6,
        });
        break;
      case "television":
        this.sample("binaryInterface", {
          gain: 0.07 * intensity,
          offset: ((options.step ?? 0) % 18) * 4.8,
          duration: 0.42,
          playbackRate: 1.08,
          fadeOut: 0.08,
        });
        this.noise({
          duration: 0.21,
          frequency: 2700,
          gain: 0.18 * intensity,
          type: "bandpass",
          q: 0.8,
        });
        this.tone({
          frequency: 6400,
          endFrequency: 3700,
          duration: 0.085,
          gain: 0.014 * intensity,
          type: "square",
        });
        break;
      case "futuristic":
        if (
          this.sample("futuristicNoises", {
            gain: 0.12 * intensity,
            offset: 0.35,
            duration: 1.1,
            playbackRate: 1.06,
            fadeOut: 0.18,
          })
        ) {
          break;
        }
        this.play("radar", { intensity: intensity * 0.82 });
        this.noise({
          duration: 0.055,
          frequency: 4100,
          endFrequency: 1700,
          gain: 0.05 * intensity,
          delay: 0.12,
          type: "bandpass",
          q: 3.2,
        });
        break;
      case "powerOn":
        this.sample("sciFiWhoosh", {
          gain: 0.1,
          duration: 1.15,
          fadeOut: 0.2,
        });
        this.sample("futuristicNoises", {
          gain: 0.075,
          offset: 0.25,
          duration: 0.85,
          delay: 0.12,
          fadeOut: 0.14,
        });
        this.play("television", { intensity: 0.8 });
        this.tone({
          frequency: 92,
          endFrequency: 1680,
          duration: 0.32,
          gain: 0.045,
          delay: 0.07,
          type: "sawtooth",
        });
        this.noise({
          duration: 0.26,
          frequency: 520,
          endFrequency: 4600,
          gain: 0.06,
          delay: 0.07,
          type: "bandpass",
          q: 2.6,
        });
        break;
      case "powerOff":
        this.sample("sciFiWhoosh", {
          gain: 0.075,
          offset: 1.2,
          duration: 0.8,
          playbackRate: 0.88,
          fadeOut: 0.18,
        });
        this.tone({
          frequency: 1420,
          endFrequency: 72,
          duration: 0.24,
          gain: 0.05,
          type: "sawtooth",
        });
        this.noise({
          duration: 0.22,
          frequency: 4800,
          endFrequency: 420,
          gain: 0.075,
          type: "bandpass",
          q: 1.8,
        });
        break;
      case "frameTransition": {
        const step = Math.max(0, Math.min(4, options.step ?? 0));

        if (
          this.sample("roboticGlitch", {
            gain: (step === 4 ? 0.18 : 0.13) * intensity,
            offset: step * 0.3,
            duration: step === 4 ? 0.42 : 0.27,
            playbackRate: 0.92 + step * 0.055,
            fadeOut: 0.045,
          })
        ) {
          break;
        }

        if (step === 0) {
          this.noise({
            duration: 0.09,
            frequency: 520,
            endFrequency: 3100,
            gain: 0.07 * intensity,
            type: "bandpass",
            q: 4.5,
          });
          this.tone({
            frequency: 210,
            endFrequency: 980,
            duration: 0.075,
            gain: 0.022 * intensity,
            type: "sawtooth",
          });
        } else if (step === 1) {
          this.tone({
            frequency: 145,
            endFrequency: 1540,
            duration: 0.11,
            gain: 0.038 * intensity,
            type: "sawtooth",
          });
          this.noise({
            duration: 0.095,
            frequency: 760,
            endFrequency: 4400,
            gain: 0.06 * intensity,
            type: "bandpass",
            q: 2.8,
          });
        } else if (step === 2) {
          [0, 0.025, 0.05].forEach((delay, index) => {
            this.noise({
              duration: 0.016,
              frequency: 3300 + index * 850,
              gain: 0.06 * intensity,
              delay,
              type: "bandpass",
              q: 3.4,
            });
          });
        } else if (step === 3) {
          this.tone({
            frequency: 1760,
            endFrequency: 260,
            duration: 0.075,
            gain: 0.032 * intensity,
            type: "square",
          });
          this.noise({
            duration: 0.07,
            frequency: 5800,
            endFrequency: 1300,
            gain: 0.055 * intensity,
            type: "highpass",
          });
        } else {
          this.tone({
            frequency: 1320,
            endFrequency: 88,
            duration: 0.17,
            gain: 0.06 * intensity,
            type: "sawtooth",
          });
          this.noise({
            duration: 0.16,
            frequency: 5600,
            endFrequency: 460,
            gain: 0.11 * intensity,
            type: "bandpass",
            q: 1.2,
          });
          [0.03, 0.078, 0.12].forEach((delay, index) => {
            this.noise({
              duration: 0.015,
              frequency: 6900 - index * 900,
              gain: 0.05 * intensity,
              delay,
              type: "highpass",
            });
          });
        }
        break;
      }
      case "scroll": {
        const direction = options.direction ?? 1;
        const scrollStep = options.step ?? 0;

        if (
          scrollStep % 3 === 0 &&
          this.sample("binaryInterface", {
            gain: 0.045 * intensity,
            offset: (scrollStep % 20) * 4.15,
            duration: 0.08,
            playbackRate: direction > 0 ? 1.08 : 0.94,
            fadeOut: 0.025,
          })
        ) {
          break;
        }
        this.tone({
          frequency: direction > 0 ? 720 : 940,
          endFrequency: direction > 0 ? 980 : 610,
          duration: 0.018,
          gain: 0.014 * intensity,
          type: "square",
        });
        this.noise({
          duration: 0.02,
          frequency: direction > 0 ? 1700 : 2400,
          gain: 0.016 * intensity,
          type: "bandpass",
          q: 2.4,
        });
        break;
      }
    }
  }

  private tone({
    frequency,
    endFrequency = frequency,
    duration,
    gain,
    delay = 0,
    type = "sine",
  }: ToneOptions) {
    const start = this.context.currentTime + delay;
    const end = start + duration;
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(20, frequency), start);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(20, endFrequency),
      end,
    );

    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(
      Math.max(0.0002, gain),
      start + Math.min(0.012, duration * 0.3),
    );
    envelope.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(envelope);
    envelope.connect(this.output);
    oscillator.start(start);
    oscillator.stop(end + 0.015);
  }

  private sample(
    sample: SoundSample,
    {
      gain,
      offset = 0,
      duration,
      delay = 0,
      playbackRate = 1,
      fadeIn = 0.006,
      fadeOut = 0.06,
    }: SampleOptions,
  ) {
    const buffer = this.samples.get(sample);
    if (!buffer) return false;

    const safeRate = Math.max(0.5, Math.min(playbackRate, 2));
    const safeOffset = Math.max(
      0,
      Math.min(offset, Math.max(0, buffer.duration - 0.02)),
    );
    const availableDuration = Math.max(0.02, buffer.duration - safeOffset);
    const safeDuration = Math.max(
      0.02,
      Math.min(duration ?? availableDuration, availableDuration),
    );
    const start = this.context.currentTime + Math.max(0, delay);
    const end = start + safeDuration / safeRate;
    const source = this.context.createBufferSource();
    const envelope = this.context.createGain();

    source.buffer = buffer;
    source.playbackRate.value = safeRate;
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(
      Math.max(0.0002, gain),
      start + Math.min(fadeIn, safeDuration * 0.3),
    );
    envelope.gain.setValueAtTime(
      Math.max(0.0002, gain),
      Math.max(start, end - Math.min(fadeOut, safeDuration * 0.45)),
    );
    envelope.gain.exponentialRampToValueAtTime(0.0001, end);

    source.connect(envelope);
    envelope.connect(this.output);
    source.start(start, safeOffset, safeDuration);
    source.stop(end + 0.02);
    return true;
  }

  private noise({
    duration,
    frequency,
    endFrequency = frequency,
    gain,
    delay = 0,
    type = "lowpass",
    q = 0.7,
  }: NoiseOptions) {
    const start = this.context.currentTime + delay;
    const end = start + duration;
    const frameCount = Math.ceil(this.context.sampleRate * duration);
    const buffer = this.context.createBuffer(
      1,
      frameCount,
      this.context.sampleRate,
    );
    const channel = buffer.getChannelData(0);

    for (let index = 0; index < frameCount; index += 1) {
      channel[index] = Math.random() * 2 - 1;
    }

    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const envelope = this.context.createGain();

    source.buffer = buffer;
    filter.type = type;
    filter.frequency.setValueAtTime(Math.max(20, frequency), start);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(20, endFrequency),
      end,
    );
    filter.Q.value = q;

    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(
      Math.max(0.0002, gain),
      start + Math.min(0.008, duration * 0.2),
    );
    envelope.gain.exponentialRampToValueAtTime(0.0001, end);

    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.output);
    source.start(start);
    source.stop(end + 0.015);
  }
}
