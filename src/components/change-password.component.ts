import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {States} from '../providers/states';
import {Utils} from '../providers/utils';
import {FormControl, Validators} from '@angular/forms';

@Component({
    selector: 'change-password',
    templateUrl: 'change-password.component.html'
})

export class ChangePasswordComponent implements OnInit {

    passwordFormControl: FormControl;

    constructor(public dialogRef: MatDialogRef<any>, public states: States, public utils: Utils) {
    }

    ngOnInit() {
        this.passwordFormControl = new FormControl('', [
            Validators.minLength(8)
        ]);
    }

    change(newPassword: string = null) {
        this.dialogRef.close(newPassword);
    }

}
