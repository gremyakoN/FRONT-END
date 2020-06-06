import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {States} from '../providers/states';
import {Utils} from '../providers/utils';

@Component({
    selector: 'event-select',
    templateUrl: 'event-select.component.html'
})

export class EventSelectComponent implements OnInit {

    selectedEventID: string;

    constructor(public dialogRef: MatDialogRef<any>, public states: States, public utils: Utils) {
    }

    ngOnInit() {
        this.updateSelection(this.states.events.value[0] ? this.states.events.value[0].id : null);
    }

    updateSelection(selectionID) {
        this.selectedEventID = selectionID;
    }

    select(selectionID: string = null) {
        if (selectionID === null) {
            this.dialogRef.close();
        } else {
            this.updateSelection(selectionID);
        }
    }

    apply() {
        this.dialogRef.close(this.selectedEventID);
    }

}
