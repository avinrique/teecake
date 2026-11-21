import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { defineConfig, type Plugin } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function injectServerStatePlugin(): Plugin {
  return {
    name: 'inject-server-state-plugin',
    transformIndexHtml(html: string) {
      try {
        const stateFile = path.resolve(__dirname, 'data', 'shared-app-state.json');
        if (fs.existsSync(stateFile)) {
          const raw = fs.readFileSync(stateFile, 'utf-8');
          const script = `<script id="server-app-state">window.__SERVER_APP_STATE__ = ${JSON.stringify(JSON.parse(raw)).replace(/</g, '\\u003c')};</script>`;
          if (html.includes('<script id="server-app-state">')) {
            return html.replace(/<script id="server-app-state">[\s\S]*?<\/script>/, script);
          }
          return html.replace('</head>', `  ${script}\n  </head>`);
        }
      } catch (e) {
        console.warn('Could not inject server state into HTML:', e);
      }
      return html;
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [injectServerStatePlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
