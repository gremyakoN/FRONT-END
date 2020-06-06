import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {States} from '../providers/states';
import {Committee} from '../classes/Interfaces';
import {FormControl, Validators} from '@angular/forms';
import {Server} from '../providers/server';
import {BigPopupComponent} from './big-popup.component';

@Component({
    selector: 'primary-organization-details',
    templateUrl: 'primary-organization-details.component.html'
})

export class PrimaryOrganizationDetailsComponent extends BigPopupComponent implements OnInit {

    filteredCommittees: Array<Committee>;
    editable: boolean;
    adding: boolean;

    constructor(public dialogRef: MatDialogRef<any>, public states: States, private server: Server, @Inject(MAT_DIALOG_DATA) public data: any) {
        super(dialogRef);
        this.FIELDS = [
            'committee_id',
            'name',
            'address',
            'phone',
            'email'
        ];
        this.formControls = {
            'committee_id': new FormControl('', [Validators.required]),
            'name': new FormControl('', [Validators.required]),
            'address': new FormControl('', [Validators.required]),
            'email': new FormControl('', [Validators.email])
        };

    }

    ngOnInit() {
        super.ngOnInit();
        if (!this.data) {
            this.adding = true;
            this.data = {
                committee_id: this.states.user.value.work_committee_id
            };
        }
        if (this.states.user.value.hierarchy_level === 4) {
            this.formControls['committee_id'].valueChanges.subscribe(value => {
                if (typeof (value) !== 'string') {
                    this.formControls['committee_id'].reset('', {emitEvent: false});
                }
                this.filterCommittees(value);
            });
            this.filterCommittees('');
            this.updateParentCommitteeName();
            this.editable = true;
        } else {
            this.FIELDS.shift();
            this.editable = this.states.user.value.is_admin && (this.states.user.value.hierarchy_level === 1) && (this.states.user.value.work_committee_id === this.data.committee_id);
        }
        // this.editable = false;
    }

    updateParentCommitteeName() {
        this.formControls['committee_id'].reset(this.states.committees.value[this.data.committee_id].name, {emitEvent: false});
    }

    filterCommittees(value: string) {
        if (typeof (value) === 'string') {
            const lowerCaseValue = value.toLowerCase();
            this.filteredCommittees = this.states.committees.value.filter(option => {
                return option.name.toLowerCase().includes(lowerCaseValue);
            });
        }
    }

    parentCommitteeSelectorFocused() {
        this.filterCommittees('');
        this.formControls['committee_id'].setValue('');
    }

    selectParentCommittee(committee: Committee, target: any) {
        this.data.committee_id = committee.id;
        target.blur();
    }

    save() {
        this.states.curtainVisible.set(true);
        const serverCommand: Function = this.adding ? this.server.addPrimaryOrganization : this.server.updatePrimaryOrganization;
        serverCommand.bind(this.server)(this.data).then(response => {
            this.dialogRef.close(response.primary_organizations);
        }).catch(error => {
            this.processError(error);
            console.error('savePrimaryOrganization error:', error);
        }).finally(() => {
            this.states.curtainVisible.set(false);
        });
    }

    delete() {
        this.states.curtainVisible.set(true);
        this.server.deletePrimaryOrganization(this.data).then(response => {
            this.dialogRef.close(response.primary_organizations);
        }).catch(error => {
            this.processError(error);
            console.error('deletePrimaryOrganization error:', error);
        }).finally(() => {
            this.states.curtainVisible.set(false);
        });
    }
}
