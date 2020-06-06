export class EventGenerator {

  listeners: Array<Function>;

  constructor() {
    this.listeners = [];
  }

  subscribe(listener: Function) {
    if (this.listeners.indexOf(listener) === -1) {
      this.listeners.push(listener);
    }
  }

  unsubscribe(listener: Function) {
    const index: number = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  emit(...args: Array<any>) {
    const listenersCopy: Array<Function> = this.listeners.concat();
    listenersCopy.forEach(listener => {
      if (listener) {
        listener(...args);
      }
    });
  }

}
