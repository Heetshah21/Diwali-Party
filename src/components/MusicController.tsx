'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MusicController() {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Use a royalty-free instrumental Diwali/Indian track
    // We'll use a placeholder that the user can swap out
    const audio = new Audio('/music/festive-vibes.mp3');
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      setLoading(true);
      try {
        await audioRef.current.play();
        setPlaying(true);
      } catch {
        // Audio file not found — that's okay
        console.log('Music file not available. Add /public/music/festive-vibes.mp3 to enable.');
      }
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
        onClick={toggleMusic}
        id="music-controller"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full
          bg-black/60 backdrop-blur-md border border-amber-500/40 text-amber-300
          hover:border-amber-400 hover:bg-black/80 transition-all duration-300
          shadow-lg hover:shadow-amber-500/20 hover:shadow-xl group"
        title={playing ? 'Pause Vibes' : 'Play Vibes'}
      >
        <span className="text-lg">
          {loading ? '⏳' : playing ? '🔊' : '🔇'}
        </span>
        <span className="text-xs font-semibold tracking-wider uppercase hidden sm:block">
          {playing ? 'Vibes ON' : 'Play Vibes'}
        </span>
        {/* Equalizer bars when playing */}
        {playing && (
          <div className="flex items-end gap-0.5 h-4">
            {[1, 2, 3].map(i => (
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
      </motion.button>
    </AnimatePresence>
  );
}
