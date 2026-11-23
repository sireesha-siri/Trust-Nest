/**
 * Design Tokens for TrustNest
 * Aligned with the approved visual concept.
 */

export const colors = {
  primary: '#694CFF',
  primaryHover: '#573BD6',
  primaryLight: '#A78BFA',
  primary50: '#F3F0FF',
  primary100: '#EBE5FF',

  secondary: '#A78BFA',
  secondaryLight: '#C4B5FD',

  accentGreen: '#22C55E',
  accentGreenDark: '#16A34A',
  accentGreenLight: '#DCFCE7',

  background: '#F8F7FF',
  surface: '#FFFFFF',
  surfaceSubtle: '#F9FAFB',

  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  border: '#E5E7EB',
  borderHover: '#D1D5DB',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
  lg: '0 10px 15px -3px rgba(105, 76, 255, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
  purple: '0 8px 24px -4px rgba(105, 76, 255, 0.25)',
} as const;

export const radii = {
  sm: '0.375rem', // 6px
  md: '0.5rem',   // 8px
  lg: '0.75rem',  // 12px
  xl: '1rem',     // 16px
  '2xl': '1.25rem', // 20px
  full: '9999px',
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;
