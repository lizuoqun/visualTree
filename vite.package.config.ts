import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/components/visualTopo.ts'),
      name: 'VisualTopo',
      fileName: (format) => `visualTopo.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['d3'],
      output: {
        // 在UMD构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          d3: 'd3'
        }
      }
    },
    outDir: 'dist',
    sourcemap: true,
    // 不复制public目录到dist
    copyPublicDir: false
  },
  // 配置静态资源处理，不处理图片
  assetsInclude: []
});