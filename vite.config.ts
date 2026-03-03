import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({ insertTypesEntry: true, include: ['src'] }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'SuperJsonEditor',
      formats: ['es', 'umd'],
      fileName: (format) => `super-json-editor.${format}.js`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'lucide-react',
        '@codemirror/lang-json',
        '@codemirror/lint',
        '@uiw/react-codemirror',
        'jsonc-parser',
        'react-resizable-panels',
        'clsx',
        'tailwind-merge'
      ],
      output: {
        exports: 'named',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          'react-resizable-panels': 'ResizablePanels',
          'lucide-react': 'Lucide',
          '@uiw/react-codemirror': 'CodeMirror',
          '@codemirror/lang-json': 'langJson',
          '@codemirror/lint': 'lint',
          'jsonc-parser': 'jsoncParser',
          'clsx': 'clsx',
          'tailwind-merge': 'tailwindMerge'
        },
      },
    },
  },
});
