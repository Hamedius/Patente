import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// برای پروژه ساده نیازی به پلاگین جدا نداریم؛ اما اگر خواستی:
// npm i -D @vitejs/plugin-react
export default defineConfig({
  plugins: [react()],
})