import { ImageResponse } from 'next/og';
import { MARK_PATHS } from '@/components/ui';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Full-bleed square: iOS rounds the corners itself.
export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', background: 'linear-gradient(135deg, #0f8a69, #0a5a63)' }}>
      <svg width="180" height="180" viewBox="0 0 64 64">
        <g fill="none" stroke="#fff" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round"><path d={MARK_PATHS.u} /><path d={MARK_PATHS.arrow} /></g>
        <circle cx="49" cy="45" r="4.5" fill="#f5b21a" />
      </svg>
    </div>,
    size,
  );
}
