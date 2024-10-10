import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
// @ts-ignore
import basicSsl from '@vitejs/plugin-basic-ssl';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), basicSsl()],
  base: '/visualTree/',
  server: {
    host: '0.0.0.0',
    port: 5178
  }
});
