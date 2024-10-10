import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
export default defineConfig({
  plugins: [vue(), basicSsl(), AutoImport({
    imports: ['vue'], // 路径下自动生成文件夹存放全局指令
    dts: 'src/auto-import.d.ts'
  })],
  base: '/visualTree/',
  server: {
    host: '0.0.0.0',
    port: 5178
  }
});
