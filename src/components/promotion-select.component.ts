import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {States} from '../providers/states';

@Component({
    selector: 'promotion-select',
    templateUrl: 'promotion-select.component.html'
})

export class PromotionSelectComponent implements OnInit {

    selectedPromotionID: string;
    selectedValue: number;

    constructor(public dialogRef: MatDialogRef<any>, public states: States) {
    }

    ngOnInit() {
        this.updateSelection(this.states.promotions.value[0] ? this.states.promotions.value[0].id : null);
    }

    updateSelection(selectionID) {
        this.selectedPromotionID = selectionID;
        if (selectionID) {
            this.selectedValue = this.states.promotionsByID.value[selectionID].min_value;
        }
    }

    select(selectionID: string = null) {
        if (selectionID === null) {
            this.dialogRef.close();
        } else {
            this.updateSelection(selectionID);
        }
    }

    apply() {
        this.dialogRef.close({id: this.selectedPromotionID, value: this.selectedValue});
    }

}
