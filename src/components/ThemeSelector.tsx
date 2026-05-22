import { Theme } from '../types';
import { Palette } from 'lucide-react';
import { motion } from 'motion/react';
import { audio } from '../lib/audio';

interface ThemeSelectorProps {
  current: Theme;
  onChange: (t: Theme) => void;
}

const themes: { id: Theme; label: string; color: string }[] = [
  { id: 'cyberpunk', label: 'NEON', color: '#00f0ff' },
  { id: 'space', label: 'VOID', color: '#fbbf24' },
  { id: 'rgb', label: 'RAZER', color: '#ff00ff' },
  { id: 'hacker', label: 'MATRIX', color: '#00ff00' }
];

export default function ThemeSelector({ current, onChange }: ThemeSelectorProps) {
  return (
    <div className="relative z-50 flex items-center space-x-1 sm:space-x-2 max-w-[calc(100vw-120px)] overflow-x-auto no-scrollbar">
      <div className="p-1.5 sm:p-2 flex-shrink-0 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hidden sm:block">
        <Palette className="w-3 h-3 sm:w-4 sm:h-4 text-white/50" />
      </div>
      <div className="flex flex-nowrap bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md items-center">
        {themes.map(t => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            onPointerEnter={() => audio.playHover()}
            className={`relative px-2 sm:px-4 py-1 sm:py-1.5 text-[9px] sm:text-xs font-mono font-bold uppercase transition-colors rounded-full whitespace-nowrap flex-shrink-0 ${
              current === t.id ? 'text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            {current === t.id && (
              <motion.div
                layoutId="theme-bubble"
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: t.color, boxShadow: `0 0 10px ${t.color}` }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
