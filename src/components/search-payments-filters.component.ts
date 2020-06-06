import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {StateComponent} from '../classes/StateComponent';
import {Committee, SearchPaymentsParams} from '../classes/Interfaces';
import {States} from '../providers/states';
import {FormControl} from '@angular/forms';
import {State} from '../classes/State';

@Component({
    selector: 'search-payments-filters',
    templateUrl: 'search-payments-filters.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SearchPaymentsFiltersComponent extends StateComponent implements OnInit {

    formControls: Array<FormControl>;
    searchFiltersFieldNames: Array<string> = ['committee_id', 'period', 'is_erip'];
    data: SearchPaymentsParams = {
        committee_id: null,
        period: null,
        is_erip: null
    } as SearchPaymentsParams;
    filteredCommittees: Array<Committee>;
    changed: State<boolean> = new State<boolean>(false);
    cleared: State<boolean> = new State<boolean>(true);
    years: Array<number>;

    constructor(changeDetectorRef: ChangeDetectorRef, public states: States) {
        super(changeDetectorRef);
    }

    ngOnInit() {
        this.formControls = [];
        this.searchFiltersFieldNames.forEach(searchFilterFieldName => {
            this.formControls[searchFilterFieldName] = new FormControl();
            this.data[searchFilterFieldName] = null;
        });
        this.formControls['committee_id'].valueChanges.subscribe(value => {
            if (typeof (value) !== 'string') {
                this.formControls['committee_id'].reset('', {emitEvent: false});
            }
            this.filterCommittees(value);
        });
        this.years = [];
        const currentYear: number = new Date().getFullYear();
        let year = 2019;
        do {
            this.years.push(year++);
        } while (year <= currentYear);
        this.filterCommittees('');
        this.updateCommitteeName();
        this.renderStates([this.states.user, this.states.searchPaymentsParams, this.states.searchPaymentsFiltersExpanded, this.changed, this.cleared]);
    }

    setField(fieldName: string, value: any) {
        this.data[fieldName] = (value === false) ? null : value;
        this.updateStates();
    }

    committeeFocused() {
        this.filterCommittees('');
        this.formControls['committee_id'].reset('');
    }

    committeeBlurred() {
        this.updateCommitteeName();
    }

    selectCommittee(committee: Committee, target: any) {
        this.setField('committee_id', committee ? committee.id : null);
        target.blur();
        this.updateCommitteeName();
    }

    updateCommitteeName() {
        this.formControls['committee_id'].reset((this.data.committee_id !== null) ? this.states.committeesByID.value[this.data.committee_id].name : '', {emitEvent: false});
    }


    filterCommittees(value: string) {
        if (typeof (value) === 'string') {
            const lowerCaseValue = value.toLowerCase();
            let availableCommittees: Array<Committee> = [];
            if (this.states.user.value.hierarchy_level > 2) {
                availableCommittees = this.states.committees.value;
            } else {
                this.fillAvailableCommittees(this.states.user.value.work_committee_id, availableCommittees);
            }
            this.filteredCommittees = availableCommittees.filter(option => {
                return option.name.toLowerCase().includes(lowerCaseValue);
            });
        }
    }

    fillAvailableCommittees(committeeID: string, availableCommittees) {
        const committee: Committee = this.states.committeesByID.value[committeeID];
        availableCommittees.push(committee);
        if (committee.children && committee.children.length) {
            committee.children.forEach(child => {
                this.fillAvailableCommittees(child.id, availableCommittees);
            });
        }
    }


    updateStates() {
        let changed = false;
        let cleared = true;
        this.searchFiltersFieldNames.forEach(checkingFieldName => {
            if (this.data[checkingFieldName] !== this.states.searchPaymentsParams.value[checkingFieldName]) {
                changed = true;
            }
            if (this.data[checkingFieldName] !== null) {
                cleared = false;
            }
        });
        if (changed !== this.changed.value) {
            this.changed.set(changed);
        }
        if (cleared !== this.cleared.value) {
            this.cleared.set(cleared);
        }
    }

    removeSearchParam(searchParamFieldName: string, apply: boolean = true) {
        this.data[searchParamFieldName] = null;
        this.formControls[searchParamFieldName].reset('', {emitEvent: false});
        if (apply) {
            this.applySearchParams();
        } else {
            this.updateStates();
        }
    }

    clearAllSearchParams() {
        this.searchFiltersFieldNames.forEach(searchParamFieldName => {
            this.removeSearchParam(searchParamFieldName, false);
        });
        this.updateStates();
    }

    applySearchParams() {
        const searchParams: SearchPaymentsParams = JSON.parse(JSON.stringify(this.states.searchParams.value));
        this.searchFiltersFieldNames.forEach(searchParamFieldName => {
            searchParams[searchParamFieldName] = this.data[searchParamFieldName];
        });
        this.states.searchPaymentsParams.set(searchParams);
        this.updateStates();
    }
}
