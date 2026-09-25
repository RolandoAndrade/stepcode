const TARGET = 'stepcode.letsbuildsolutions.com'

// Browsers that installed the PWA on an old hostname answer navigations from the precache and
// refuse a redirected service-worker update, so they would never see the redirect. This worker
// replaces the old one, unregisters itself and reloads its pages, which then hit the redirect.
const KILL_SWITCH = `self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration
      .unregister()
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => Promise.all(clients.map((client) => client.navigate(client.url)))),
  )
})
`

export default {
  fetch(request) {
    const url = new URL(request.url)
    if (url.pathname === '/sw.js') {
      return new Response(KILL_SWITCH, {
        headers: { 'content-type': 'text/javascript', 'cache-control': 'no-store' },
      })
    }
    url.protocol = 'https:'
    url.hostname = TARGET
    url.port = ''
    return Response.redirect(url.toString(), 301)
  },
}
