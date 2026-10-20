(() => {
  const base = '/elveran-watches';
  const updateLinks = () => {
    document.querySelectorAll('a[href^="/"]').forEach((link) => {
      const destination = link.getAttribute('href');
      if (!destination || destination.startsWith(`${base}/`)) return;
      if (destination === '/admin') {
        link.remove();
        return;
      }
      link.setAttribute('href', `${base}${destination}`);
    });
  };
  new MutationObserver(updateLinks).observe(document, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', updateLinks, { once: true });
  else updateLinks();
})();

