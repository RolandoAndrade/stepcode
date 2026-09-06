import { createDriver } from './driver'
import type { DriverPort, HostMessage, WorkerMessage } from './protocol'

// The worker's global scope, narrowed to what the driver needs. `lib: DOM` types `self` as a
// window, whose `postMessage` and `onmessage` differ in shape from a worker's; this adapter
// keeps the driver's port type honest without pulling the WebWorker lib into the app.
const scope = self as unknown as {
  postMessage(message: WorkerMessage): void
  onmessage: ((event: MessageEvent<HostMessage>) => void) | null
}

const port: DriverPort = {
  postMessage: (message) => {
    scope.postMessage(message)
  },
  onmessage: null,
}

createDriver(port)

scope.onmessage = (event) => {
  port.onmessage?.({ data: event.data })
}
