import { motion } from 'motion/react';
import { SpeedData, Theme } from '../types';
import { Download, Upload, Activity, Zap, Share2, Crown, Skull } from 'lucide-react';

interface ResultsCardProps {
  data: SpeedData;
  theme: Theme;
}

export default function ResultsCard({ data, theme }: ResultsCardProps) {
  const getRoast = (download: number) => {
    if (download < 10) return { msg: "Bro is using stone age WiFi 💀", icon: <Skull className="w-6 h-6 text-red-500" /> };
    if (download < 50) return { msg: "Your internet is powered by a hamster on a wheel 🐹", icon: <Zap className="w-6 h-6 text-yellow-500" /> };
    if (download < 200) return { msg: "Not bad, you can legally watch 1080p without buffering 👍", icon: <Activity className="w-6 h-6 text-blue-500" /> };
    if (download < 500) return { msg: "Fast. The FBI is definitely tracking your downloads 🕶️", icon: <Zap className="w-6 h-6 text-blue-400" /> };
    return { msg: "NASA called, they want their internet back 🚀", icon: <Crown className="w-6 h-6 text-yellow-400" /> };
  };

  const roast = getRoast(data.download);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.4 }}
      className="relative w-full max-w-2xl mx-auto p-1 rounded-2xl bg-gradient-to-br from-[var(--acc-primary)] to-[var(--acc-secondary)] z-20 group mt-4 sm:mt-0"
    >
      <div className="bg-[var(--bg-base)] rounded-xl p-4 sm:p-8 h-full cyber-border relative overflow-hidden">
        {/* Background glow effects inside card */}
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-[var(--acc-primary)] opacity-10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-64 sm:h-64 bg-[var(--acc-secondary)] opacity-10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
            
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left space-y-2 sm:space-y-0 sm:space-x-3 bg-white/5 border border-white/10 px-4 sm:px-6 py-3 rounded-2xl sm:rounded-full mb-6 sm:mb-8 backdrop-blur-md">
                {roast.icon}
                <span className="font-sans text-xs sm:text-sm md:text-base text-white/90 font-medium leading-tight">
                    {roast.msg}
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 w-full mb-6 sm:mb-8">
                <StatBox icon={<Download />} label="DOWNLOAD" value={data.download} unit="Mbps" color="var(--acc-secondary)" />
                <StatBox icon={<Upload />} label="UPLOAD" value={data.upload} unit="Mbps" color="var(--acc-primary)" />
                <StatBox icon={<Activity />} label="PING" value={data.ping} unit="ms" color="var(--acc-tertiary)" />
                <StatBox icon={<Zap />} label="JITTER" value={data.jitter} unit="ms" color="white" />
            </div>

            <button 
                className="group relative inline-flex w-full sm:w-auto items-center justify-center px-4 sm:px-8 py-3 text-xs sm:text-base font-mono font-bold text-white transition-all duration-300 bg-transparent border-2 border-[var(--acc-primary)] rounded hover:bg-[var(--acc-primary)] hover:text-black overflow-hidden box-glow"
                onClick={() => {
                     // For a real app, integrate html2canvas
                     alert("Screenshot captured! (Mock)");
                }}
            >
                <span className="absolute inset-0 w-full h-full -mt-1 rounded opacity-30 bg-gradient-to-b from-transparent via-transparent to-black" />
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span>SHARE SECURE REPORT</span>
            </button>
        </div>
      </div>
    </motion.div>
  );
}

function StatBox({ icon, label, value, unit, color }: any) {
    return (
        <div className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-lg bg-white/5 border border-white/5 backdrop-blur-sm transition-transform hover:scale-105">
            <div style={{ color }} className="mb-1 sm:mb-2 opacity-80 scale-75 sm:scale-100">
                {icon}
            </div>
            <div className="font-mono text-lg sm:text-2xl font-bold text-white tracking-widest text-glow" style={{ textShadow: `0 0 10px ${color}`}}>
                {value.toFixed(1)}
            </div>
            <div className="font-sans text-[9px] sm:text-xs text-white/50 uppercase tracking-widest mt-1 text-center leading-tight">
                {label} <br className="hidden sm:block" /> <span className="text-[8px] sm:text-[10px] opacity-70">({unit})</span>
            </div>
        </div>
    )
}
