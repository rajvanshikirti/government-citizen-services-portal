/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gov: {
          blue: '#0F4C81',
          'blue-dark': '#0A3558',
          'blue-light': '#E8F1F8',
          green: '#1B5E20',
          'green-light': '#E8F5E9',
          saffron: '#FF9933',
          'saffron-light': '#FFF3E6',
          success: '#2E7D32',
          error: '#C62828',
          bg: '#F5F7FA',
          card: '#FFFFFF',
          border: '#D9E2EC',
          text: '#1F2937',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        gov: '0 1px 3px 0 rgba(15, 76, 129, 0.08), 0 1px 2px -1px rgba(15, 76, 129, 0.06)',
        'gov-md': '0 4px 6px -1px rgba(15, 76, 129, 0.08), 0 2px 4px -2px rgba(15, 76, 129, 0.06)',
        'gov-lg': '0 10px 15px -3px rgba(15, 76, 129, 0.08), 0 4px 6px -4px rgba(15, 76, 129, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
