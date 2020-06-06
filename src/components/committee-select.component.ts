import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {States} from '../providers/states';
import {FormControl} from '@angular/forms';
import {Committee} from '../classes/Interfaces';

@Component({
    selector: 'committee-select',
    templateUrl: 'committee-select.component.html'
})

export class CommitteeSelectComponent {

    formControl: FormControl;
    filteredCommittees: Array<Committee>;

    constructor(public dialogRef: MatDialogRef<any>, public states: States) {
        this.formControl = new FormControl();
        this.formControl.valueChanges.subscribe(value => {
            if (typeof (value) !== 'string') {
                this.formControl.reset('', {emitEvent: false});
            }
            this.filterCommittees(value);
        });
        this.filterCommittees('');
        this.updateCommitteeName();
    }

    select(committeeID: string = null) {
        this.dialogRef.close(committeeID);
    }

    committeeFocused() {
        this.filterCommittees('');
        this.formControl.reset('');
    }

    committeeBlurred() {
        this.updateCommitteeName();
    }

    updateCommitteeName() {
        this.formControl.reset('', {emitEvent: false});
    }

    filterCommittees(value: string) {
        if (typeof (value) === 'string') {
            const lowerCaseValue = value.toLowerCase();
            this.filteredCommittees = this.states.committees.value.filter(option => {
                return option.name.toLowerCase().includes(lowerCaseValue);
            });
        }
    }
}
