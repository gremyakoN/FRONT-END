import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {States} from '../providers/states';

@Component({
    selector: 'category-select',
    templateUrl: 'category-select.component.html'
})

export class CategorySelectComponent {

    constructor(public dialogRef: MatDialogRef<any>, public states: States) {
    }

    select(selectionID: string = null) {
        this.dialogRef.close(selectionID);
    }

}
