import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatBottomSheet, MatDialogRef} from '@angular/material';
import {States} from '../providers/states';
import {FormControl} from '@angular/forms';
import {Server} from '../providers/server';
import {BigPopupComponent} from './big-popup.component';
import * as moment from 'moment';
import {Moment} from 'moment';
import {Utils} from '../providers/utils';
import {Committee, SearchParams, SearchResult} from '../classes/Interfaces';
import {ColorPickerComponent} from './color-picker.component';
import {State} from '../classes/State';


@Component({
    selector: 'add-event',
    templateUrl: 'add-event.component.html'
})

export class AddEventComponent extends BigPopupComponent implements OnInit, OnDestroy {

    DEFAULT_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--defaultEventBackground').replace(' ', '');

    adding: boolean;
    minInsertedParamBound: Function;
    maxInsertedParamBound: Function;
    filteredCommittees: Array<Committee>;
    searchParams: State<SearchParams> = new State<SearchParams>({
        page_number: 1,
        page_size: 10,
    } as SearchParams);
    searchResult: State<SearchResult> = new State<SearchResult>(null);
    searching: State<boolean> = new State<boolean>(false);
    searchColumns = ['surname', 'firstname', 'patronymic', 'email', 'phone'];
    searchMembersBound: Function;

    constructor(public dialogRef: MatDialogRef<any>, private bottomSheet: MatBottomSheet, public states: States, private server: Server, public utils: Utils, @Inject(MAT_DIALOG_DATA) public data: any) {
        super(dialogRef);
        this.FIELDS = [
            'name',
            'address',
            'date_from',
            'date_to',
            'additional_info',
            'mark'
        ];
        this.formControls = {
            date_to_hours: new FormControl(),
            date_to_minutes: new FormControl(),
            date_from_hours: new FormControl(),
            date_from_minutes: new FormControl()
        };
        this.minInsertedParamBound = this.minInsertedParam.bind(this);
        this.maxInsertedParamBound = this.maxInsertedParam.bind(this);
        if (!this.data) {
            this.data = {};
        }
        if (this.data.id === undefined) {
            this.adding = true;
        }
        this.data.editable = this.states.user.value.is_admin;
        this.searchMembersBound = this.searchMembers.bind(this);
    }

    ngOnInit() {
        if (this.states.user.value.hierarchy_level === 4) {
            this.FIELDS.unshift('committee_id');
            if (this.data.committee_id === undefined) {
                this.data.committee_id = this.states.user.value.committee_id;
            }
        }
        super.ngOnInit();
        this.searchParams.value.event_id = this.data.id;
        this.searchParams.subscribe(this.searchMembersBound);
        if (this.data.id) {
            this.searchMembers();
        }
        if (this.data.date_from) {
            this.formControls['date_from'].setValue(moment(this.data.date_from));
            this.formControls['date_from_hours'].setValue(this.getHours(this.formControls['date_from'].value));
            this.formControls['date_from_minutes'].setValue(this.getMinutes(this.formControls['date_from'].value));
        }
        if (this.data.date_to) {
            this.formControls['date_to'].setValue(moment(this.data.date_to));
            this.formControls['date_to_hours'].setValue(this.getHours(this.formControls['date_to'].value));
            this.formControls['date_to_minutes'].setValue(this.getMinutes(this.formControls['date_to'].value));
        }
        if (this.formControls['committee_id']) {
            this.formControls['committee_id'].valueChanges.subscribe(value => {
                if (typeof (value) !== 'string') {
                    this.formControls['committee_id'].reset('', {emitEvent: false});
                }
                this.filterCommittees(value);
            });
            this.filterCommittees('');
            this.updateCommitteeName();
        }
    }

    ngOnDestroy(): void {
        this.searchParams.unsubscribe(this.searchMembersBound);
    }

    searchMembers() {
        this.searching.set(true);
        this.server.getMembers(this.searchParams.value).then(response => {
            this.searchResult.set(response);
        }).finally(() => {
            this.searching.set(false);
        });
    }

    openColorPicker() {
        this.bottomSheet.open(ColorPickerComponent, {
            data: this.data.color || this.DEFAULT_COLOR,
            panelClass: 'colorPickerBottomSheet'
        }).afterDismissed().subscribe(color => {
            if (color) {
                this.data.color = color.replace('#', '');
            }
        });
    }

    committeeFocused() {
        this.filterCommittees('');
        this.formControls['committee_id'].reset('');
    }

    committeeBlurred() {
        this.updateCommitteeName();
    }

    updateCommitteeName() {
        this.formControls['committee_id'].reset((this.data.committee_id !== undefined) ? this.states.committees.value[this.data.committee_id].name : '', {emitEvent: false});
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
        this.data.committee_id = committee.id;
        target.blur();
        this.updateCommitteeName();
    }

    updateDateField(field: string) {
        const hoursFormControl = this.formControls['date_' + field + '_hours'];
        const minutesFormControl = this.formControls['date_' + field + '_minutes'];
        if (hoursFormControl.value === null) {
            hoursFormControl.setValue(0);
            minutesFormControl.setValue(0);
        }
        this.data['date_' + field] = this.utils.convertToJAVADate(this.formControls['date_' + field].value) + 'T' + hoursFormControl.value + ':' + minutesFormControl.value;
    }

    minInsertedParam(date: Moment): boolean {
        return this.formControls['date_to'].value ? (date.toDate().getTime() <= this.formControls['date_to'].value.toDate().getTime()) : true;
    }

    maxInsertedParam(date: Moment): boolean {
        return this.formControls['date_from'].value ? (date.toDate().getTime() >= this.formControls['date_from'].value.toDate().getTime()) : true;
    }

    getHours(date: Moment) {
        return moment(date).hours();
    }

    getMinutes(date: Moment) {
        return moment(date).minutes();
    }

    save() {
        this.states.curtainVisible.set(true);
        const serverCommand: Function = this.adding ? this.server.addEvent : this.server.updateEvent;
        serverCommand.bind(this.server)(this.data).then(response => {
            this.dialogRef.close(response.events);
        }).catch(error => {
            this.processError(error);
            console.error('saveEvent error:', error);
        }).finally(() => {
            this.states.curtainVisible.set(false);
        });
    }

    delete() {
        this.states.curtainVisible.set(true);
        this.server.deleteEvent(this.data.id).then(response => {
            this.dialogRef.close(response.events);
        }).catch(error => {
            this.processError(error);
            console.error('deleteEvent error:', error);
        }).finally(() => {
            this.states.curtainVisible.set(false);
        });
    }

    applyEventMark() {
        this.states.curtainVisible.set(true);
        this.server.applyEventMark(this.data.id).then(() => {
        }).catch(error => {
            this.processError(error);
            console.error('applyEventMark error:', error);
        }).finally(() => {
            this.states.curtainVisible.set(false);
        });
    }
}
