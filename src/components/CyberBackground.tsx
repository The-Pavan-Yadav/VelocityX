import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { SpeedTestState, Theme } from '../types';

interface CyberBackgroundProps {
  state: SpeedTestState;
  theme: Theme;
  warpMode?: boolean;
}

const ParticleTunnel = ({ state, theme, warpMode }: CyberBackgroundProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particleCount = useMemo(() => {
     if (typeof window !== 'undefined') {
         return window.innerWidth < 768 ? 1500 : 5000;
     }
     return 5000;
  }, []);
  
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const spd = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 2 + Math.random() * 8; 
      pos[i * 3] = r * Math.cos(theta); // x
      pos[i * 3 + 1] = r * Math.sin(theta); // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50; // z (depth)
      
      spd[i] = 0.1 + Math.random() * 0.5;
    }
    return [pos, spd];
  }, [particleCount]);

  useFrame((stateCtx, delta) => {
    if (!pointsRef.current) return;
    
    // Base speed
    let speedZ = 0.5;
    let rotationSpd = 0.05;
    
    if (state === 'ping') {
      speedZ = 5;
    } else if (state === 'download') {
      speedZ = warpMode ? 60 : 30; // warp speed
      rotationSpd = warpMode ? 1.5 : 0.5;
      
      // Screen shake effect on high speed
      pointsRef.current.position.x = 0;
      pointsRef.current.position.y = 0;
    } else if (state === 'upload') {
      speedZ = warpMode ? -60 : -30; // reverse thrust feel
      rotationSpd = warpMode ? 1.0 : 0.3;
    } else {
      pointsRef.current.position.x = 0;
      pointsRef.current.position.y = 0;
    }
    
    pointsRef.current.rotation.z -= delta * rotationSpd;
    
    const positionsAttr = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < particleCount; i++) {
        // Move along Z
        positionsAttr.setZ(i, positionsAttr.getZ(i) + delta * speedZ * speeds[i] * 5);
        
        // Loop back
        if (positionsAttr.getZ(i) > 25 && speedZ > 0) {
            positionsAttr.setZ(i, -25);
        } else if (positionsAttr.getZ(i) < -25 && speedZ < 0) {
            positionsAttr.setZ(i, 25);
        }
    }
    positionsAttr.needsUpdate = true;
  });

  const getColor = () => {
    if (warpMode) return '#ffffff'; // White out in warp mode
    if (theme === 'cyberpunk') return '#00f0ff';
    if (theme === 'space') return '#f8fafc';
    if (theme === 'hacker') return '#00ff00';
    if (theme === 'rgb') return '#ff00ff';
    return '#00f0ff';
  };

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={getColor()}
        size={warpMode ? 0.2 : 0.1}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

export default function CyberBackground({ state, theme, warpMode }: CyberBackgroundProps) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 0], fov: warpMode ? 90 : 75 }}>
        <ParticleTunnel state={state} theme={theme} warpMode={warpMode} />
      </Canvas>
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-transparent to-transparent opacity-80" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[var(--bg-base)] opacity-50" />
    </div>
  );
}
