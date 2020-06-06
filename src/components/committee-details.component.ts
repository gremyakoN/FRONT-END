import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {States} from '../providers/states';
import {Committee} from '../classes/Interfaces';
import {FormControl, Validators} from '@angular/forms';
import {Server} from '../providers/server';
import {BigPopupComponent} from './big-popup.component';

@Component({
    selector: 'committee-details',
    templateUrl: 'committee-details.component.html'
})

export class CommitteeDetailsComponent extends BigPopupComponent implements OnInit {

    filteredCommittees: Array<Committee>;
    editable: boolean;
    adding: boolean;

    constructor(public dialogRef: MatDialogRef<any>, public states: States, private server: Server, @Inject(MAT_DIALOG_DATA) public data: any) {
        super(dialogRef);
        this.formControls = {
            'name': new FormControl('', [Validators.required]),
            'address': new FormControl('', [Validators.required]),
            'unp': new FormControl('', [Validators.required]),
            'email': new FormControl('', [Validators.email])
        };
        this.FIELDS = [
            'parent_id',
            'name',
            'address',
            'unp',
            'iban',
            'bic',
            'service_no',
            'phone',
            'email',
            'unicode'
        ];
    }

    ngOnInit() {
        super.ngOnInit();
        if (!this.data) {
            this.adding = true;
            this.data = {
                parent_id: this.states.committees.value[0].id
            };
        }
        if (this.data.parent_id !== undefined) {
            this.formControls['parent_id'].valueChanges.subscribe(value => {
                if (typeof (value) !== 'string') {
                    this.formControls['parent_id'].reset('', {emitEvent: false});
                }
                this.filterCommittees(value);
            });
            this.filterCommittees('');
            this.updateParentCommitteeName();
        } else {
            this.FIELDS.shift();
        }
        this.editable = this.states.user.value.is_admin && (this.states.user.value.hierarchy_level > 2);
        // this.editable = false;
    }

    parentCommitteeFocused() {
        this.filterCommittees('');
        this.formControls['parent_id'].reset('');
    }

    parentCommitteeBlurred() {
        this.updateParentCommitteeName();
    }

    updateParentCommitteeName() {
        this.formControls['parent_id'].reset(this.states.committees.value[this.data.parent_id].name, {emitEvent: false});
    }

    filterCommittees(value: string) {
        if (typeof (value) === 'string') {
            const lowerCaseValue = value.toLowerCase();
            this.filteredCommittees = this.states.committees.value.filter(option => {
                return option.name.toLowerCase().includes(lowerCaseValue);
            });
        }
    }

    selectParentCommittee(committee: Committee, target: any) {
        this.data.parent_id = committee.id;
        target.blur();
        this.updateParentCommitteeName();
    }

    save() {
        this.states.curtainVisible.set(true);
        const serverCommand: Function = this.adding ? this.server.addCommittee : this.server.updateCommittee;
        serverCommand.bind(this.server)(this.data).then(response => {
            this.dialogRef.close(response.committees);
        }).catch(error => {
            this.processError(error);
            console.error('saveCommitee error:', error);
        }).finally(() => {
            this.states.curtainVisible.set(false);
        });
    }

    delete() {
        this.states.curtainVisible.set(true);
        this.server.deleteCommittee(this.data).then(response => {
            this.dialogRef.close(response.committees);
        }).catch(error => {
            this.processError(error);
            console.error('deleteCommitee error:', error);
        }).finally(() => {
            this.states.curtainVisible.set(false);
        });
    }
}
