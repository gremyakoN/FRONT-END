import {EventGenerator} from './EventGenerator';

export class State<T> extends EventGenerator {

  value: T;

  constructor(value: T) {
    super();
    this.listeners = [];
    this.set(value);
  }

  set(newValue: T, ...args: Array<any>) {
    this.value = newValue;
    this.emit(...args);
  }

  setField(fieldName: string, newValue: any, ...args: Array<any>) {
    this.value[fieldName] = newValue;
    this.emit(...args);
  }

  get type(): string {
    return ((this.value !== undefined) && (this.value !== null)) ? this.value.constructor.name : undefined;
  }

}
