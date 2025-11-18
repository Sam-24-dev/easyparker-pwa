/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5047E6',   // CTA principal (indigo/purple) - Extraído de tus imágenes
          dark: '#3B34C2',      // Hover / pressed states
          light: '#818CF8',     // Highlights, badges
        },
        navy: '#10182B',        // Fondo principal (dark) - De tus mockups
        panel: '#293044',       // Cards / paneles secundarios - Nuevo color intermedio
        indigo: '#5047E6',      // Alias de primary (compatibilidad)
        accent: '#8B5CF6',      // Purple para gradients y hover
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        white: '#FFFFFF',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
