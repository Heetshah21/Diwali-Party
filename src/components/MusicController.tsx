'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MusicController() {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  // Default to 2.0x (200% boost) so party music is loud and energetic
  const [gainLevel, setGainLevel] = useState(2.0);
  const [showVolumePanel, setShowVolumePanel] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceConnectedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio('/music/festive-vibes.mp3');
    audio.loop = true;
    audio.volume = 1.0; // Base volume at 100% (boosted from prior 0.35)
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Update Web Audio gain node or fallback audio element volume
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      try {
        gainNodeRef.current.gain.setTargetAtTime(
          gainLevel,
          audioContextRef.current.currentTime,
          0.05
        );
      } catch {
        gainNodeRef.current.gain.value = gainLevel;
      }
    } else if (audioRef.current && !gainNodeRef.current) {
      audioRef.current.volume = Math.min(1.0, Math.max(0, gainLevel / 2));
    }
  }, [gainLevel]);

  const initAudioGraph = () => {
    if (sourceConnectedRef.current || !audioRef.current) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaElementSource(audioRef.current);
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gainNodeRef.current = gainNode;

      // Dynamics compressor prevents harsh distortion/clipping during high amplification
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-10, ctx.currentTime);
      compressor.knee.setValueAtTime(25, ctx.currentTime);
      compressor.ratio.setValueAtTime(12, ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);

      source.connect(gainNode);
      gainNode.connect(compressor);
      compressor.connect(ctx.destination);

      sourceConnectedRef.current = true;
    } catch (err) {
      console.warn('Web Audio gain initialization fallback:', err);
    }
  };

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      setLoading(true);
      try {
        initAudioGraph();
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        await audioRef.current.play();
        setPlaying(true);
      } catch {
        console.log('Music play fallback. File: /music/festive-vibes.mp3');
      }
      setLoading(false);
    }
  };

  const getBoostLabel = (val: number) => {
    const percent = Math.round(val * 100);
    if (percent <= 100) return `${percent}% (Standard)`;
    if (percent <= 200) return `${percent}% (Boosted 🚀)`;
    return `${percent}% (Max Party 🔥)`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Volume & Boost Control Popover */}
      <AnimatePresence>
        {showVolumePanel && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-72 p-4 rounded-2xl bg-neutral-950/95 border border-amber-500/40 
              backdrop-blur-xl shadow-2xl shadow-amber-500/10 text-white select-none mb-1"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <span className="text-base">🔊</span>
                <span className="text-xs font-bold tracking-wider uppercase text-amber-300">
                  Music Volume Boost
                </span>
              </div>
              <button
                onClick={() => setShowVolumePanel(false)}
                className="text-white/40 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/10 transition"
              >
                ✕
              </button>
            </div>

            {/* Current Gain Value */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-amber-200/70 font-medium">Amplification</span>
              <span className="text-xs font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                {getBoostLabel(gainLevel)}
              </span>
            </div>

            {/* Slider */}
            <div className="mb-3">
              <input
                type="range"
                min="0.5"
                max="2.8"
                step="0.1"
                value={gainLevel}
                onChange={(e) => setGainLevel(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-neutral-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-white/40 mt-1">
                <span>50%</span>
                <span className="text-amber-300/70 font-semibold">100%</span>
                <span>200% 🚀</span>
                <span>280% 🔥</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {[
                { label: '100%', val: 1.0 },
                { label: '200% 🚀', val: 2.0 },
                { label: '280% 🔥', val: 2.8 },
              ].map((preset) => (
                <button
                  key={preset.val}
                  onClick={() => setGainLevel(preset.val)}
                  className={`py-1 text-xs rounded-lg font-semibold transition ${
                    Math.abs(gainLevel - preset.val) < 0.05
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                      : 'bg-neutral-900 border border-amber-500/20 text-amber-300/80 hover:bg-neutral-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <p className="text-[10px] text-amber-400/50 mt-2.5 text-center leading-tight">
              Boosted past standard limits with Web Audio Gain
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Music Pill Controller */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="flex items-center rounded-full bg-black/75 backdrop-blur-md 
          border border-amber-500/40 text-amber-300 shadow-xl shadow-amber-500/10 
          hover:border-amber-400 transition-all duration-300 overflow-hidden"
      >
        {/* Play / Pause Toggle Button */}
        <button
          onClick={toggleMusic}
          id="music-controller"
          className="flex items-center gap-2.5 px-4 py-3 hover:bg-amber-500/10 transition-colors"
          title={playing ? 'Pause Vibes' : 'Play Vibes (Volume Boosted)'}
        >
          <span className="text-lg">
            {loading ? '⏳' : playing ? '🔊' : '🔇'}
          </span>
          <span className="text-xs font-semibold tracking-wider uppercase hidden sm:inline">
            {playing ? 'Vibes ON' : 'Play Vibes'}
          </span>

          {/* Equalizer animation when playing */}
          {playing && (
            <div className="flex items-end gap-0.5 h-4 ml-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-0.5 bg-amber-400 rounded-full"
                  style={{
                    animation: `eq ${0.5 + i * 0.15}s ease-in-out infinite alternate`,
                    height: `${30 + i * 20}%`,
                  }}
                />
              ))}
            </div>
          )}
        </button>

        {/* Volume Boost Popover Toggle Button */}
        <button
          onClick={() => setShowVolumePanel((prev) => !prev)}
          className={`flex items-center gap-1 px-3 py-3 border-l border-amber-500/30 text-xs 
            hover:bg-amber-500/15 transition-colors ${
              showVolumePanel ? 'bg-amber-500/20 text-amber-200' : 'text-amber-300/80'
            }`}
          title="Boost / Adjust Volume"
          aria-label="Volume Boost Settings"
        >
          <span className="font-bold text-[11px] text-amber-400">
            {gainLevel >= 1.8 ? '🚀' : '🎚️'}
          </span>
          <span className="text-[11px] font-semibold hidden md:inline">
            {Math.round(gainLevel * 100)}%
          </span>
        </button>
      </motion.div>
    </div>
  );
}
