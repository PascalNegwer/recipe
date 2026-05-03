import {
  defineConfig,
  minimal2023Preset as preset
} from '@vite-pwa/assets-generator/config'

// https://vite-pwa-org.netlify.app/assets-generator/cli
export default defineConfig({
  headLinkOptions: {
    preset: '2023'
  },
  preset,
  images: ['assets/logo.png']
})