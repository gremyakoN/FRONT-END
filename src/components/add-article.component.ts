import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {States} from '../providers/states';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Committee} from '../classes/Interfaces';
import {FormControl} from '@angular/forms';

@Component({
    selector: 'add-article',
    templateUrl: 'add-article.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddArticleComponent implements OnInit {

    committeeFormControl: FormControl;
    filteredCommittees: Array<Committee>;
    adding: boolean;

    constructor(public dialogRef: MatDialogRef<any>, public states: States, @Inject(MAT_DIALOG_DATA) public article: any) {
        if (!this.article) {
            this.adding = true;
            this.article = {};
        }
    }

    ngOnInit() {
        if (this.states.user.value.hierarchy_level === 4) {
            if (this.article.committee_id === undefined) {
                this.article.committee_id = this.states.user.value.committee_id;
            }
            this.committeeFormControl = new FormControl();
            this.committeeFormControl.valueChanges.subscribe(value => {
                if (typeof (value) !== 'string') {
                    this.committeeFormControl.reset('', {emitEvent: false});
                }
                this.filterCommittees(value);
            });
            this.filterCommittees('');
            this.updateCommitteeName();
        }
    }

    committeeFocused() {
        this.filterCommittees('');
        this.committeeFormControl.reset('');
    }

    committeeBlurred() {
        this.updateCommitteeName();
    }

    updateCommitteeName() {
        this.committeeFormControl.reset((this.article.committee_id !== undefined) ? this.states.committees.value[this.article.committee_id].name : '', {emitEvent: false});
    }

    filterCommittees(value: string) {
        if (typeof (value) === 'string') {
            const lowerCaseValue = value.toLowerCase();
            this.filteredCommittees = this.states.committees.value.filter(option => {
                return option.name.toLowerCase().includes(lowerCaseValue);
            });
        }
    }

    selectCommittee(committee: Committee, target: any) {
        this.article.committee_id = committee.id;
        target.blur();
        this.updateCommitteeName();
    }

    close() {
        this.dialogRef.close();
    }

    add() {
        this.dialogRef.close(this.article);
    }

}
