import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {States} from '../providers/states';
import {FormControl, Validators} from '@angular/forms';
import {Server} from '../providers/server';
import {BigPopupComponent} from './big-popup.component';

@Component({
    selector: 'category-edit',
    templateUrl: 'category-edit.component.html'
})

export class CategoryEditComponent extends BigPopupComponent implements OnInit {

    adding: boolean;

    constructor(public dialogRef: MatDialogRef<any>, public states: States, private server: Server, @Inject(MAT_DIALOG_DATA) public data: any) {
        super(dialogRef);
        this.FIELDS = [
            'name',
            'amount'
        ];
        this.formControls = {
            'name': new FormControl('', [Validators.required]),
            'amount': new FormControl('', [Validators.required, Validators.min(0), Validators.pattern('\\-?\\d*\\.?\\d{1,2}')])
        };
    }

    ngOnInit() {
        super.ngOnInit();
        if (!this.data) {
            this.data = {
                name: '',
                amount: 0
            };
            this.adding = true;
        }
    }

    save() {
        this.states.curtainVisible.set(true);
        const serverCommand: Function = this.adding ? this.server.addCategory : this.server.updateCategory;
        serverCommand.bind(this.server)(this.data).then(response => {
            this.dialogRef.close(response.categories);
        }).catch(error => {
            this.processError(error);
            console.error('saveCategory error:', error);
        }).finally(() => {
            this.states.curtainVisible.set(false);
        });
    }

    delete() {
        this.states.curtainVisible.set(true);
        this.server.deleteCategory(this.data).then(response => {
            this.dialogRef.close(response.categories);
        }).catch(error => {
            this.processError(error);
            console.error('deleteCategory error:', error);
        }).finally(() => {
            this.states.curtainVisible.set(false);
        });
    }
}
