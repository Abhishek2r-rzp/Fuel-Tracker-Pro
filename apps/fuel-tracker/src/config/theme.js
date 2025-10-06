/**
 * Pastel Theme Configuration
 * 
 * Light and Dark mode color palettes with soft, minimalist pastel colors
 */

export const pastelTheme = {
  light: {
    // Primary pastel purple
    primary: {
      50: '#FAF5FF',
      100: '#F3E8FF',
      200: '#E9D5FF',
      300: '#D8B4FE',
      400: '#C084FC',
      500: '#A855F7',
      600: '#9333EA',
      700: '#7E22CE',
      800: '#6B21A8',
      900: '#581C87',
    },
    
    // Pastel pink accent
    accent: {
      50: '#FDF2F8',
      100: '#FCE7F3',
      200: '#FBCFE8',
      300: '#F9A8D4',
      400: '#F472B6',
      500: '#EC4899',
      600: '#DB2777',
    },
    
    // Pastel blue
    secondary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
    },
    
    // Pastel green (success)
    success: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
    },
    
    // Pastel peach (warning)
    warning: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#F97316',
    },
    
    // Pastel red (error)
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
    },
    
    // Neutral grays (very light)
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    
    // Background colors
    background: {
      primary: '#FAFAFA',      // Main background
      secondary: '#F5F5F5',    // Cards, panels
      tertiary: '#FFFFFF',     // Elevated surfaces
    },
    
    // Text colors
    text: {
      primary: '#262626',      // Main text
      secondary: '#525252',    // Secondary text
      tertiary: '#737373',     // Muted text
      inverse: '#FFFFFF',      // Text on dark backgrounds
    },
    
    // Border colors
    border: {
      light: '#F5F5F5',
      default: '#E5E5E5',
      dark: '#D4D4D4',
    },
  },
  
  dark: {
    // Primary pastel purple (darker shades)
    primary: {
      50: '#2E1065',
      100: '#3B1C7A',
      200: '#4C1D95',
      300: '#6B21A8',
      400: '#7E22CE',
      500: '#9333EA',
      600: '#A855F7',
      700: '#C084FC',
      800: '#D8B4FE',
      900: '#E9D5FF',
    },
    
    // Pastel pink accent (darker)
    accent: {
      50: '#831843',
      100: '#9F1239',
      200: '#BE123C',
      300: '#DB2777',
      400: '#EC4899',
      500: '#F472B6',
      600: '#F9A8D4',
    },
    
    // Pastel blue (darker)
    secondary: {
      50: '#172554',
      100: '#1E3A8A',
      200: '#1E40AF',
      300: '#2563EB',
      400: '#3B82F6',
      500: '#60A5FA',
    },
    
    // Pastel green (darker)
    success: {
      50: '#14532D',
      100: '#166534',
      200: '#15803D',
      300: '#16A34A',
      400: '#22C55E',
      500: '#4ADE80',
    },
    
    // Pastel peach (darker)
    warning: {
      50: '#7C2D12',
      100: '#9A3412',
      200: '#C2410C',
      300: '#EA580C',
      400: '#F97316',
      500: '#FB923C',
    },
    
    // Pastel red (darker)
    error: {
      50: '#7F1D1D',
      100: '#991B1B',
      200: '#B91C1C',
      300: '#DC2626',
      400: '#EF4444',
      500: '#F87171',
    },
    
    // Neutral grays (dark mode)
    neutral: {
      50: '#171717',
      100: '#262626',
      200: '#404040',
      300: '#525252',
      400: '#737373',
      500: '#A3A3A3',
      600: '#D4D4D4',
      700: '#E5E5E5',
      800: '#F5F5F5',
      900: '#FAFAFA',
    },
    
    // Background colors (dark)
    background: {
      primary: '#0A0A0A',      // Main background
      secondary: '#171717',    // Cards, panels
      tertiary: '#262626',     // Elevated surfaces
    },
    
    // Text colors (dark)
    text: {
      primary: '#FAFAFA',      // Main text
      secondary: '#E5E5E5',    // Secondary text
      tertiary: '#A3A3A3',     // Muted text
      inverse: '#171717',      // Text on light backgrounds
    },
    
    // Border colors (dark)
    border: {
      light: '#262626',
      default: '#404040',
      dark: '#525252',
    },
  },
};

export default pastelTheme;
