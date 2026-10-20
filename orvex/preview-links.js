document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest?.('a[href^="/"]');
  if (!link || link.hasAttribute('download') || link.target === '_blank') return;
  const destination = link.getAttribute('href');
  if (!destination || destination.startsWith('/orvex/') || destination.startsWith('/assets/')) return;
  event.preventDefault();
  window.location.assign(`/orvex${destination}`);
}, true);
