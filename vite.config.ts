import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Dev  : reads .env              (manage-x / dev Supabase project)
// Prod : reads .env.production   (CodeAutomationManageX / prod Supabase project)
export default defineConfig({
  plugins: [react()],
})
