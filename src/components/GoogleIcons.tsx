import React from 'react';

/**
 * Official Google Multicolored "G" Logo
 */
export const GoogleGLogo: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-7 h-7',
  size,
}) => (
  <svg
    viewBox="0 0 48 48"
    width={size}
    height={size}
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.79l7.97-6.2z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

/**
 * Custom Luffy Straw Hat Avatar (matching the user's screenshot)
 */
export const LuffyAvatar: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div
    className={`${className} rounded-full overflow-hidden relative flex-shrink-0 bg-[#e8a87c] border border-amber-400/40 shadow-sm`}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background dark / sky */}
      <rect width="100" height="100" fill="#2d3748" />

      {/* Straw Hat Brim */}
      <ellipse cx="50" cy="38" rx="46" ry="14" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
      {/* Red Ribbon on Hat */}
      <path d="M 24 35 Q 50 40 76 35 L 75 30 Q 50 34 25 30 Z" fill="#dc2626" />
      {/* Hat Crown */}
      <path d="M 28 32 C 28 10, 72 10, 72 32 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
      <path d="M 33 22 Q 50 25 67 22" stroke="#b45309" strokeWidth="1.5" fill="none" opacity="0.6" />

      {/* Spiky Black Hair */}
      <path
        d="M 20 45 L 26 55 L 30 46 L 36 58 L 40 48 L 45 56 L 50 46 L 56 57 L 62 48 L 68 58 L 72 47 L 78 54 L 80 44 Z"
        fill="#111827"
      />

      {/* Face */}
      <path d="M 26 48 C 26 78, 74 78, 74 48 Z" fill="#fed7aa" />

      {/* Big Eyes */}
      <ellipse cx="40" cy="54" rx="4" ry="5" fill="#111827" />
      <circle cx="41" cy="53" r="1.5" fill="#ffffff" />
      <ellipse cx="60" cy="54" rx="4" ry="5" fill="#111827" />
      <circle cx="61" cy="53" r="1.5" fill="#ffffff" />

      {/* Scar under left eye */}
      <path d="M 38 62 L 42 66 M 38 64 L 42 64" stroke="#991b1b" strokeWidth="1.2" strokeLinecap="round" />

      {/* Big Signature Grin */}
      <path d="M 36 68 Q 50 78 64 68 Q 50 72 36 68 Z" fill="#ffffff" stroke="#991b1b" strokeWidth="1" />
      <path d="M 36 68 Q 50 80 64 68" stroke="#111827" strokeWidth="1.5" fill="none" />

      {/* Red Vest & Collar */}
      <path d="M 26 78 L 22 100 L 78 100 L 74 78 Z" fill="#dc2626" />
      {/* Chest V-neck */}
      <polygon points="50,92 36,78 64,78" fill="#fed7aa" />
    </svg>
  </div>
);

/**
 * Fingerprint Biometric Scanner SVG Icon
 */
export const BiometricFingerprintIcon: React.FC<{ className?: string; isScanning?: boolean }> = ({
  className = 'w-6 h-6',
  isScanning = false,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} ${isScanning ? 'animate-pulse text-sky-400' : ''}`}
  >
    <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
    <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
    <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
    <path d="M2 12a10 10 0 0 1 18-6" />
    <path d="M2 16h.01" />
    <path d="M21.8 16c.2-2 .131-5.354 0-6" />
    <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
    <path d="M8.65 22c.21-.66.45-1.32.57-2" />
    <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
  </svg>
);
