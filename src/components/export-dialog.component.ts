import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {States} from '../providers/states';

@Component({
    selector: 'export-dialog',
    templateUrl: 'export-dialog.component.html'
})

export class ExportDialogComponent {

    constructor(public dialogRef: MatDialogRef<any>, public states: States) {
    }

    close(agreed: boolean = false) {
        this.dialogRef.close(agreed);
    }

}
