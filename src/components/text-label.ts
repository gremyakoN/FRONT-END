import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {StateComponent} from '../classes/StateComponent';
import {States} from '../providers/states';

@Component({
  selector: 'text-label',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TextLabelComponent extends StateComponent implements OnChanges, OnDestroy {

  updateTextBound: Function;
  data: Array<string>;

  @Input() id: string;

  @Input() params: Array<any>;

  constructor(private states: States, private elementRef: ElementRef, changeDetectorRef: ChangeDetectorRef) {
    super(changeDetectorRef);
    this.updateTextBound = this.updateText.bind(this);
    this.states.lang.subscribe(this.updateTextBound);
    this.states.texts.subscribe(this.updateTextBound);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateText();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.states.lang.unsubscribe(this.updateTextBound);
    this.states.texts.unsubscribe(this.updateTextBound);
  }

  updateText() {
    if (this.id) {
      const IDs: Array<string> = this.id.split('.');
      let obj: any = this.states.texts.value;
      if (obj) {
        IDs.forEach(id => {
          obj = obj[id];
        });
        this.data = obj;
        let str: string = this.data[this.states.lang.value];
        if (this.params) {
          this.params.forEach((param, i) => {
            str = str.split('%' + (i + 1)).join(param);
          });
        }
        this.elementRef.nativeElement.innerHTML = str;
      }
    }
  }

}
