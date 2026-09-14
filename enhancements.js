/* Optional power-user controls layered onto the core static library. */
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('asset-covers') === 'off') { document.documentElement.classList.add('covers-off'); document.querySelector('#coverToggle').classList.remove('is-active'); }
  document.querySelector('#coverToggle').addEventListener('click', event => {
    const disabled = document.documentElement.classList.toggle('covers-off');
    event.currentTarget.classList.toggle('is-active', !disabled);
    localStorage.setItem('asset-covers', disabled ? 'off' : 'on');
  });
  document.querySelector('#favoritesButton').addEventListener('click', () => {
    const input = document.querySelector('#searchInput');
    input.value = '';
    state.search = '';
    const root = document.querySelector('#content');
    const files = shownFiles(allFiles().filter(file => state.favorites.has(file.path)));
    root.replaceChildren(section('Favorites', `${files.length} saved files`));
    if (!files.length) { root.append(empty('No favorites yet', 'Use Save on any asset card to keep it here.')); return; }
    const grid = el('div', `asset-grid ${state.view}`); grid.append(...files.map(assetCard)); root.append(grid);
  });
  document.querySelector('#clearSelection').addEventListener('click', () => { state.selected.clear(); persistSets(); updateSelectionBar(); render(); });
  document.querySelector('#bulkCopy').addEventListener('click', () => {
    const urls = allFiles().filter(file => state.selected.has(file.path)).map(publicURL).join('\n');
    copyText(urls, document.querySelector('#bulkCopy'), 'Selected URLs copied', 'Copy URLs');
  });
  document.querySelector('#bulkDownload').addEventListener('click', () => {
    const files = allFiles().filter(file => state.selected.has(file.path));
    files.forEach((file, index) => setTimeout(() => {
      const url = publicURL(file);
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        /* SW active: navigate to ?export=download — SW returns Content-Disposition: attachment */
        const exportUrl = url + (url.includes('?') ? '&' : '?') + 'export=download';
        const a = document.createElement('a'); a.href = exportUrl; a.style.display = 'none';
        document.body.append(a); a.click(); a.remove();
      } else {
        /* SW not yet controlling: fetch + blob fallback */
        fetch(url).then(r => r.blob()).then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = blobUrl; a.download = file.name;
          document.body.append(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        });
      }
    }, index * 300));
  });
  const decorateCards = () => document.querySelectorAll('.asset-card:not([data-enhanced])').forEach(card => {
    card.dataset.enhanced = 'true';
    const file = allFiles().find(item => item.path === card.dataset.path);
    if (!file) return;
    const utility = card.querySelector('.asset-utility');
    const share = el('button', 'favorite-button', 'Share'); share.type = 'button';
    share.onclick = () => { const link = new URL(location.href); link.searchParams.set('asset', file.path); copyText(link.href, share, 'Share link copied', 'Share'); };
    const postman = el('button', 'favorite-button', 'Postman'); postman.type = 'button';
    postman.onclick = () => copyText(JSON.stringify({ assetUrl: publicURL(file) }, null, 2), postman, 'Postman JSON copied', 'Postman');
    utility.append(postman, share);
    const tags = state.config.tags?.[file.path] || [];
    if (tags.length) { const tagBox = el('div', 'asset-tags'); tags.forEach(tag => tagBox.append(el('span', 'asset-tag', tag))); card.querySelector('.asset-info').insertBefore(tagBox, card.querySelector('.asset-actions')); }
  });
  new MutationObserver(decorateCards).observe(document.querySelector('#content'), { childList: true, subtree: true });
  setTimeout(() => { decorateCards(); const path = new URLSearchParams(location.search).get('asset'); const file = path && allFiles().find(item => item.path === path); if (file) openPreview(file); }, 500);
});
