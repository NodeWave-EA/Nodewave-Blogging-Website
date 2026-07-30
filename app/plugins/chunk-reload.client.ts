export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("app:chunkError", () => {
    // Reloads the page to fetch the newly generated HTML and chunk hashes from Vercel
    window.location.reload();
  });
});
