import {ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA,  MatBottomSheetRef} from '@angular/material';
import iro from '@jaames/iro';
import {Utils} from '../providers/utils';

@Component({
    selector: 'color-picker',
    templateUrl: 'color-picker.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ColorPickerComponent implements OnInit {

    colorWheel: any;

    constructor(private  bottomSheetRef: MatBottomSheetRef<ColorPickerComponent>, private elementRef: ElementRef, private utils: Utils, @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) {
    }

    ngOnInit() {
        this.colorWheel = iro.ColorPicker(this.elementRef.nativeElement.querySelector('[color-picker]'), {
            color: this.data.toString(),
            padding: 0,
            sliderHeight: 16,
            sliderMargin: 16,
            wheelLightness: false
        });
    }

    close() {
        this.bottomSheetRef.dismiss(this.colorWheel.color.hexString);
    }

}
