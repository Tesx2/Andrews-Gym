import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: 'index.html',
        shop: 'shop.html',
        account: 'account.html',
        member: 'member.html',
        admin: 'admin.html'
      }
    }
  }
});
