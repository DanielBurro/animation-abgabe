import { defineConfig } from 'vite';

export default defineConfig({
  // Relative Pfade, damit der Build auch unter einem Unterpfad
  // (z. B. GitHub Pages: /animation-abgabe/) funktioniert
  base: './',
  server: {
    open: true // Öffnet automatisch den Browser beim Start
  }
});
