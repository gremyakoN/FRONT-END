import {OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {FormControl} from '@angular/forms';

export class BigPopupComponent implements OnInit {

    FIELDS: Array<string>;
    formControls: any;
    error: any;
    matcher: any;
    data: any;

    constructor(public dialogRef: MatDialogRef<any>) {
    }

    ngOnInit() {
        this.matcher = {
            isErrorState: formControl => {
                return (this.error && (this.error.field === formControl.id)) || (formControl.invalid && (formControl.dirty || formControl.touched) && !formControl.pristine);
            }
        };
        if (!this.formControls) {
            this.formControls = [];
        }
        this.FIELDS.forEach(field => {
            if (!this.formControls[field]) {
                this.formControls[field] = new FormControl('');
            }
            this.formControls[field]['id'] = field;
            this.formControls[field].valueChanges.subscribe(() => {
                this.error = null;
            });
        });
    }

    cancel() {
        this.dialogRef.close();
    }

    fieldChanged(field: string, event: any) {
        this.data[field] = event.target ? event.target.value : (event.source.selected ? event.source.selected.value : event.source.checked);
    }

    processError(error) {
        if (error.field) {
            this.error = error;
        } else {
            alert(error.message);
        }
    }

}
