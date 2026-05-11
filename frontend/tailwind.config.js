export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Pretendard', 'system-ui', 'sans-serif'] },
      animation: {
        'heartbeat': 'heartbeat 0.4s ease-in-out',
        'float-up': 'floatUp 1.2s ease-out forwards',
        'slide-up': 'slideUp 0.35s ease-out',
        'pop-in': 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        heartbeat: {
          '0%,100%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.35)' },
          '60%': { transform: 'scale(0.95)' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-120px) scale(0.5)', opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        popIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
