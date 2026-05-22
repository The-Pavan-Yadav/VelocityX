import { motion } from 'motion/react';
import { Network, ArrowDown, ArrowUp, Activity } from 'lucide-react';
import { SpeedTestState, Theme } from '../types';

interface SpeedGaugeProps {
  speed: number; // The current reading
  state: SpeedTestState;
}

export default function SpeedGauge({ speed, state }: SpeedGaugeProps) {
  // Map speed out of say, max 1000 Mbps
  const maxSpeed = 1000;
  const clampedSpeed = Math.min(Math.max(speed, 0), maxSpeed);
  const percentage = clampedSpeed / maxSpeed;
  
  const circumference = 2 * Math.PI * 120; // r = 120
  const strokeDashoffset = circumference - percentage * circumference;

  let icon = <Network className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--acc-primary)] text-glow max-w-full max-h-full" />;
  let label = 'READY';
  
  if (state === 'ping') {
    icon = <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--acc-tertiary)] text-glow max-w-full max-h-full" />;
    label = 'PING';
  } else if (state === 'download') {
    icon = <ArrowDown className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--acc-secondary)] text-glow-secondary max-w-full max-h-full" />;
    label = 'DOWNLOAD';
  } else if (state === 'upload') {
    icon = <ArrowUp className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--acc-primary)] text-glow max-w-full max-h-full" />;
    label = 'UPLOAD';
  } else if (state === 'finished') {
    label = 'COMPLETE';
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-[260px] h-[260px] sm:w-80 sm:h-80 z-10 mx-auto">
      {/* Outer Glow Ring */}
      <motion.div 
        className="absolute inset-0 rounded-full box-glow opacity-20"
        animate={{
            scale: state !== 'idle' && state !== 'finished' ? [1, 1.1, 1] : 1,
            opacity: state !== 'idle' && state !== 'finished' ? [0.2, 0.5, 0.2] : 0.2
        }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
      />
      
      {/* SVG Arc Gauge */}
      <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 320 320">
        <circle
          cx="160"
          cy="160"
          r="120"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="10"
          className="text-white/10"
        />
        <motion.circle
          cx="160"
          cy="160"
          r="120"
          fill="transparent"
          stroke="var(--acc-primary)"
          strokeWidth="12"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          strokeLinecap="round"
          className="drop-shadow-[0_0_15px_var(--acc-primary)] transition-colors"
          style={{
            stroke: state === 'download' ? 'var(--acc-secondary)' : 
                   state === 'ping' ? 'var(--acc-tertiary)' : 
                   'var(--acc-primary)'
          }}
        />
      </svg>
      
      {/* Inner Content */}
      <div className="flex flex-col items-center justify-center space-y-1 sm:space-y-2 mt-2 sm:mt-4 text-center">
        <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full glass-panel cyber-border mb-1 sm:mb-2 text-center p-2">
            {icon}
        </div>
        
        <div className="flex items-baseline space-x-1">
            <motion.span 
              className="font-mono text-4xl sm:text-5xl font-bold text-white text-glow tracking-tighter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={speed} // re-animate slightly on major change if we wanted, but spring is better
            >
              {speed.toFixed(0)}
            </motion.span>
            <span className="font-sans text-xs sm:text-sm text-white/50 font-medium">Mbps</span>
        </div>
        
        <div className="font-mono text-[10px] sm:text-xs tracking-[0.2em] text-white/70 uppercase">
          {label}
        </div>
      </div>
    </div>
  );
}
