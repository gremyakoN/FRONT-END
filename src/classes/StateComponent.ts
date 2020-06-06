import {ChangeDetectorRef, OnDestroy} from '@angular/core';
import {State} from './State';

export class StateComponent implements OnDestroy {

  markForCheckStates: Array<State<any>> = [];
  markForCheckBound: Function;

  constructor(public changeDetectorRef: ChangeDetectorRef) {
    this.markForCheckBound = this.markForCheck.bind(this);
  }

  ngOnDestroy() {
    this.markForCheckStates.forEach(state => {
      state.unsubscribe(this.markForCheckBound);
    });
  }

  renderStates(newStates: Array<State<any>>) {
    newStates.forEach(state => {
      if (this.markForCheckStates.indexOf(state) === -1) {
        this.markForCheckStates.push(state);
        state.subscribe(this.markForCheckBound);
      }
    });
  }

  markForCheck() {
    this.changeDetectorRef.markForCheck();
  }

}
