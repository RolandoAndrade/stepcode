export class EventBus {
  private listeners: Map<string, Function[]>;
  constructor() {
    this.listeners = new Map();
  }
  on(event: string, callback: Function) {
    const listeners = this.listeners.get(event) || [];
    listeners.push(callback);
    this.listeners.set(event, listeners);
  }
  emit(event: string, ...args: any[]) {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach(listener => listener(...args));
  }
}