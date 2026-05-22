import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CyberBackground from './components/CyberBackground';
import SpeedGauge from './components/SpeedGauge';
import ResultsCard from './components/ResultsCard';
import ThemeSelector from './components/ThemeSelector';
import { SpeedTestState, Theme, SpeedData } from './types';
import { Zap, Volume2, VolumeX } from 'lucide-react';
import { audio } from './lib/audio';

export default function App() {
  const [theme, setTheme] = useState<Theme>('cyberpunk');
  const [state, setState] = useState<SpeedTestState>('idle');
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [warpMode, setWarpMode] = useState(false);
  const [muted, setMuted] = useState(false);
  
  const warpFired = useRef(false);

  const [results, setResults] = useState<SpeedData>({
    ping: 0,
    download: 0,
    upload: 0,
    jitter: 0
  });

  const [history, setHistory] = useState<SpeedData[]>([]);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const toggleMute = () => {
    audio.init();
    audio.resume();
    audio.playClick();
    const newMuted = !muted;
    setMuted(newMuted);
    audio.setMuted(newMuted);
  };

  // State audio effects
  useEffect(() => {
     if (state === 'ping') {
         audio.startPing();
     } else if (state === 'download') {
         audio.startDownload();
     } else if (state === 'upload') {
         audio.startUpload();
     } else if (state === 'finished') {
         audio.playResult();
     }

     return () => {
         if (state === 'ping') audio.stopPing();
         if (state === 'download') audio.stopDownload();
         if (state === 'upload') audio.stopUpload();
     }
  }, [state]);

  // Simulation logic
  useEffect(() => {
    if (state === 'idle' || state === 'finished') return;

    let targetValue = 0;
    let duration = 0;
    let nextState: SpeedTestState = 'idle';

    if (state === 'ping') {
        targetValue = 12 + Math.random() * 5; // stable ping around 15
        duration = 2000;
        nextState = 'download';
    } else if (state === 'download') {
        targetValue = 600 + Math.random() * 250; // Random fast speed
        duration = 5000;
        nextState = 'upload';
    } else if (state === 'upload') {
        targetValue = 200 + Math.random() * 100; 
        duration = 4000;
        nextState = 'finished';
    }

    let start = performance.now();
    let animFrame: number;
    let lastVal = 0;

    const animate = (time: number) => {
        const elapsed = time - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Add jitter/noise to the reading to make it look like a real test
        const noise = (Math.random() - 0.5) * (targetValue * 0.1); 
        
        // Easing out
        const easeOutQuad = (t: number) => t * (2 - t);
        const currentRefValue = targetValue * easeOutQuad(progress);
        
        const displayVal = Math.max(0, currentRefValue + (progress < 1 ? noise : 0));
        setCurrentSpeed(displayVal);
        lastVal = displayVal;

        // Audio updates
        if (state === 'download') {
            audio.updateDownload(displayVal, 1000);
            
            // Warp mode trigger
            if (displayVal > 500 && !warpFired.current) {
                warpFired.current = true;
                setWarpMode(true);
                audio.playWarp();
            }
        } else if (state === 'upload') {
             audio.updateUpload(displayVal, 1000);
        }

        if (progress < 1) {
            animFrame = requestAnimationFrame(animate);
        } else {
            // Save result
            setResults(prev => {
                const updated = {
                    ...prev,
                    [state]: lastVal,
                    ...(state === 'ping' ? { jitter: 1 + Math.random() * 4 } : {})
                };
                if (nextState === 'finished') {
                    setHistory(h => [updated, ...h].slice(0, 5));
                }
                return updated;
            });
            
            // Move to next state after a small delay
            setTimeout(() => {
                setState(nextState);
                if (nextState !== 'finished') {
                    setCurrentSpeed(0);
                }
            }, 500);
        }
    };

    animFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrame);
  }, [state]);

  const startTest = () => {
    // initialize audio on user gesture
    audio.init();
    audio.resume();
    audio.playStart();

    setState('ping');
    setResults({ ping: 0, download: 0, upload: 0, jitter: 0 });
    setCurrentSpeed(0);
    setWarpMode(false);
    warpFired.current = false;
  };

  return (
    <motion.div 
      className="relative w-full h-screen overflow-hidden flex flex-col font-sans select-none"
    >
      {warpMode && (
         <motion.div 
           className="absolute inset-0 bg-white z-50 pointer-events-none"
           initial={{ opacity: 0.8 }}
           animate={{ opacity: 0 }}
           transition={{ duration: 1.5, ease: "easeOut" }}
         />
      )}

      <CyberBackground state={state} theme={theme} warpMode={warpMode} />
      
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center space-x-2">
         <button onClick={toggleMute} className="p-2 flex-shrink-0 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors" onPointerEnter={() => audio.playHover()}>
           {muted ? <VolumeX className="w-4 h-4 text-white/50" /> : <Volume2 className="w-4 h-4 text-white/80" />}
         </button>
         <div className="relative z-50">
           <ThemeSelector current={theme} onChange={(t) => { audio.playClick(); setTheme(t); }} />
         </div>
      </div>

      {/* Header */}
      <motion.div 
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 flex items-center space-x-2 sm:space-x-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--acc-primary)] text-glow" />
        <h1 className="text-xl sm:text-2xl font-bold tracking-widest text-white uppercase text-glow">
          Velocity<span className="text-[var(--acc-secondary)]">X</span>
        </h1>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full">
        
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              className="flex flex-col items-center w-full max-w-sm mx-auto"
            >
              <button
                onClick={startTest}
                onPointerEnter={() => audio.playHover()}
                className="group relative flex items-center justify-center w-48 h-48 sm:w-64 sm:h-64 rounded-full cyber-border bg-[var(--bg-base)] box-glow overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95 mx-auto"
              >
                {/* Hexagon pattern overlay */}
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxwYXRoIGQ9Ik0wIDEwbTktNWgxMm0tNiAwaDEybTAgMTBoLTEybTYgMGgxMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuNSIvPgo8L3N2Zz4=')] bg-repeat" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <span className="font-mono text-3xl sm:text-4xl font-bold tracking-[0.2em] text-white text-glow group-hover:text-[var(--acc-primary)] transition-colors">
                    START
                  </span>
                  <span className="font-sans text-[10px] sm:text-xs tracking-[0.3em] text-white/50 mt-2">
                    INITIATE SEQUENCE
                  </span>
                </div>

                {/* Rotating ring */}
                <motion.div 
                  className="absolute inset-2 border border-dashed border-[var(--acc-primary)] rounded-full opacity-50"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                />
              </button>

              {history.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-10 sm:mt-16 w-full flex flex-col"
                  >
                      <h3 className="font-mono text-[10px] tracking-[0.2em] text-white/50 mb-2 sm:mb-3 border-b border-white/10 pb-2">PREVIOUS LOGS</h3>
                      <div className="flex flex-col space-y-2">
                          {history.map((h, i) => (
                              <div key={i} className="flex items-center justify-between p-2 sm:p-3 rounded bg-white/5 border border-white/5 text-[10px] sm:text-xs font-mono">
                                  <span className="text-white/60">DL: <span className="text-[var(--acc-primary)] font-bold">{h.download.toFixed(1)}</span></span>
                                  <span className="text-white/60">UL: <span className="text-[var(--acc-secondary)] font-bold">{h.upload.toFixed(1)}</span></span>
                                  <span className="text-white/60">PING: <span className="text-[var(--acc-tertiary)] font-bold">{h.ping.toFixed(0)}</span></span>
                              </div>
                          ))}
                      </div>
                  </motion.div>
              )}
            </motion.div>
          )}

          {(state === 'ping' || state === 'download' || state === 'upload') && (
            <motion.div
              key="testing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2, filter: "blur(20px)" }}
              className="flex flex-col items-center w-full max-w-4xl"
            >
                {/* Visualizer Frame */}
                <div className="relative flex flex-col items-center justify-center w-full gap-8 md:flex-row md:gap-12 mt-8 sm:mt-0">
                    
                    {/* Live Stats Table (Top on mobile, Left on desktop) */}
                    <div className="flex flex-row md:flex-col space-x-6 md:space-x-0 md:space-y-6 w-full md:w-48 justify-center overflow-x-auto no-scrollbar md:border-r border-white/10 md:pr-8 py-2 md:py-0">
                        <LiveStat label="PING" value={results.ping || (state === 'ping' ? currentSpeed : 0)} active={state === 'ping'} unit="ms" />
                        <LiveStat label="DOWNLOAD" value={results.download || (state === 'download' ? currentSpeed : 0)} active={state === 'download'} unit="Mbps" />
                        <LiveStat label="UPLOAD" value={results.upload || (state === 'upload' ? currentSpeed : 0)} active={state === 'upload'} unit="Mbps" />
                    </div>

                    {/* Main Gauge */}
                    <SpeedGauge speed={currentSpeed} state={state} />

                    {/* Decorative Tech info (Hidden on mobile, Right on desktop) */}
                    <div className="hidden md:flex flex-col space-y-4 w-48 border-l border-white/10 pl-8 font-mono text-[10px] text-white/40 tracking-widest">
                        <div>
                            <div className="text-[var(--acc-primary)]">SERVER</div>
                            <div className="text-white/80">NEO-TOKYO // 01</div>
                        </div>
                        <div>
                            <div className="text-[var(--acc-primary)]">LATENCY</div>
                            <div className="text-white/80">OPTIMIZED</div>
                        </div>
                        <div>
                            <div className="text-[var(--acc-primary)]">SYSTEM</div>
                            <div className="text-white/80">VelocityX CORE v9.2</div>
                        </div>
                    </div>
                </div>
            </motion.div>
          )}

          {state === 'finished' && (
            <ResultsCard key="results" data={results} theme={theme} />
          )}

        </AnimatePresence>

        {state === 'finished' && (
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                onClick={startTest}
                onPointerEnter={() => audio.playHover()}
                className="mt-8 font-mono text-sm tracking-widest text-white/50 hover:text-white transition-colors underline decoration-white/30 underline-offset-8"
            >
                REBOOT SEQUENCE
            </motion.button>
        )}
      </div>

      {/* Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-2 sm:bottom-4 w-full text-center z-50 pointer-events-none"
      >
        <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.3em] text-white/40 uppercase">
          Made by <span className="text-[var(--acc-primary)] text-glow font-bold ml-1 text-[10px] sm:text-xs">PAVAN</span>
        </p>
      </motion.div>

    </motion.div>
  );
}

function LiveStat({ label, value, active, unit }: { label: string, value: number, active: boolean, unit: string }) {
    return (
        <div className={`transition-opacity duration-300 flex-shrink-0 ${active ? 'opacity-100' : 'opacity-40'}`}>
            <div className="font-mono text-[10px] sm:text-xs tracking-widest text-[var(--acc-primary)] mb-0.5 sm:mb-1">{label}</div>
            <div className="font-mono text-lg sm:text-2xl text-white font-bold text-glow">
                {value > 0 ? value.toFixed(1) : '--'}
                <span className="text-[9px] sm:text-xs text-white/50 ml-1">{unit}</span>
            </div>
        </div>
    );
}
