import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnInit} from '@angular/core';
import {StateComponent} from '../classes/StateComponent';
import {Server} from '../providers/server';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from '@angular/material';

@Component({
    selector: 'reset-password',
    templateUrl: 'reset-password.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ResetPasswordComponent extends StateComponent {

    constructor(private elementRef: ElementRef, private server: Server, private bottomSheetRef: MatBottomSheetRef, @Inject(MAT_BOTTOM_SHEET_DATA) public data: any, changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }

    exit(send: boolean) {
        this.bottomSheetRef.dismiss(send);
    }

}
