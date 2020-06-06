import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {States} from '../providers/states';
import {FormControl, Validators} from '@angular/forms';
import {Server} from '../providers/server';
import {BigPopupComponent} from './big-popup.component';

@Component({
    selector: 'assignment-edit',
    templateUrl: 'assignment-edit.component.html'
})

export class AssignmentEditComponent extends BigPopupComponent implements OnInit {

    adding: boolean;

    constructor(public dialogRef: MatDialogRef<any>, public states: States, private server: Server, @Inject(MAT_DIALOG_DATA) public data: any) {
        super(dialogRef);
        this.FIELDS = [
            'hierarchy_level',
            'name',
            'is_admin'
        ];
        this.formControls = {
            'hierarchy_level': new FormControl('', [Validators.required]),
            'name': new FormControl('', [Validators.required])
        };
    }

    ngOnInit() {
        super.ngOnInit();
        if (!this.data) {
            this.data = {
                hierarchy_level: 0,
                name: '',
                is_admin: false
            };
            this.adding = true;
        }
    }

    save() {
        this.states.curtainVisible.set(true);
        const serverCommand: Function = this.adding ? this.server.addAssignment : this.server.updateAssignment;
        serverCommand.bind(this.server)(this.data).then(response => {
            this.dialogRef.close(response.assignments);
        }).catch(error => {
            this.processError(error);
            console.error('saveAssignment error:', error);
        }).finally(() => {
            this.states.curtainVisible.set(false);
        });
    }

    delete() {
        this.states.curtainVisible.set(true);
        this.server.deleteAssignment(this.data).then(response => {
            this.dialogRef.close(response.assignments);
        }).catch(error => {
            this.processError(error);
            console.error('deleteAssignment error:', error);
        }).finally(() => {
            this.states.curtainVisible.set(false);
        });
    }
}
