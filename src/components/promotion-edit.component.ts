import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {States} from '../providers/states';
import {FormControl, Validators} from '@angular/forms';
import {Server} from '../providers/server';
import {BigPopupComponent} from './big-popup.component';

@Component({
    selector: 'promotion-edit',
    templateUrl: 'promotion-edit.component.html'
})

export class PromotionEditComponent extends BigPopupComponent implements OnInit {

    adding: boolean;

    constructor(public dialogRef: MatDialogRef<any>, public states: States, private server: Server, @Inject(MAT_DIALOG_DATA) public data: any) {
        super(dialogRef);
        this.FIELDS = [
            'name',
            'min_value',
            'max_value'
        ];
        this.formControls = {
            'name': new FormControl('', [Validators.required])
        };
    }

    ngOnInit() {
        super.ngOnInit();
        if (!this.data) {
            this.data = {
                name: '',
                min_value: 0,
                max_value: 1
            };
            this.adding = true;
        }
    }

    save() {
        this.states.curtainVisible.set(true);
        const serverCommand: Function = this.adding ? this.server.addPromotion : this.server.updatePromotion;
        serverCommand.bind(this.server)(this.data).then(response => {
            this.dialogRef.close(response.promotions);
        }).catch(error => {
            this.processError(error);
            console.error('savePromotion error:', error);
        }).finally(() => {
            this.states.curtainVisible.set(false);
        });
    }

    delete() {
        this.states.curtainVisible.set(true);
        this.server.deletePromotion(this.data).then(response => {
            this.dialogRef.close(response.promotions);
        }).catch(error => {
            this.processError(error);
            console.error('deletePromotion error:', error);
        }).finally(() => {
            this.states.curtainVisible.set(false);
        });
    }
}
