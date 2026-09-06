const TARGET = 'stepcode.online'

export default {
  fetch(request) {
    const url = new URL(request.url)
    url.protocol = 'https:'
    url.hostname = TARGET
    url.port = ''
    return Response.redirect(url.toString(), 301)
  },
}
