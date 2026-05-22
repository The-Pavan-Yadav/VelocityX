export type Theme = 'cyberpunk' | 'space' | 'rgb' | 'hacker';

export type SpeedTestState = 'idle' | 'ping' | 'download' | 'upload' | 'finished';

export interface SpeedData {
  ping: number;
  download: number;
  upload: number;
  jitter: number;
}
