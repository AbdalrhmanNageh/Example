/*
 * sw.js - Export-to-download Service Worker
 *
 * Intercepts any request that has ?export=download and returns the file
 * with Content-Disposition: attachment so the browser saves it immediately.
 * Works for ALL file types (HTML, images, PDFs, SVG, RAR, etc.)
 *
 * HOW IT WORKS:
 * 1. Browser navigates to e.g. /Security/examples/fkdfkg.html?export=download
 * 2. This SW intercepts the request BEFORE the page loads
 * 3. SW fetches /Security/examples/fkdfkg.html (clean URL, without param)
 * 4. SW returns the response WITH Content-Disposition: attachment header
 * 5. Browser sees attachment header -> automatically saves the file
 *    The page never renders - it just downloads cleanly.
 */

/* On install, activate immediately - don't wait for old SW to die */
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

/* On activate, take control of all open tabs immediately */
self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  var url;
  try { url = new URL(event.request.url); } catch(e) { return; }

  /* Only handle requests that have ?export=download */
  if (url.searchParams.get('export') !== 'download') return;

  /* Build the clean URL - strip ?export=download */
  var cleanUrl = new URL(url.href);
  cleanUrl.searchParams.delete('export');

  /* Derive filename from the URL path */
  var filename = decodeURIComponent(url.pathname.split('/').pop() || 'download');

  event.respondWith(
    fetch(cleanUrl.href, { credentials: 'same-origin', cache: 'no-store' })
      .then(function(response) {
        if (!response.ok) {
          return new Response('File not found: ' + response.status, {
            status: response.status
          });
        }
        var newHeaders = new Headers(response.headers);
        newHeaders.set('Content-Disposition', 'attachment; filename="' + filename + '"');
        /* Remove CSP headers that can interfere */
        newHeaders.delete('Content-Security-Policy');
        newHeaders.delete('X-Frame-Options');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        });
      })
      .catch(function(err) {
        return new Response('Download failed: ' + err.message, { status: 500 });
      })
  );
});
