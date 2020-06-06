import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {StateComponent} from '../classes/StateComponent';
import {Committee, PrimaryOrganization, SearchParams} from '../classes/Interfaces';
import {States} from '../providers/states';
import {FormControl} from '@angular/forms';
import {State} from '../classes/State';
import {Utils} from '../providers/utils';
import {Moment} from 'moment';

@Component({
    selector: 'search-filters',
    templateUrl: 'search-filters.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SearchFiltersComponent extends StateComponent implements OnInit {

    filteredPrimaryOrganizations: Array<PrimaryOrganization>;
    formControls: Array<FormControl>;
    searchFiltersFieldNames: Array<string> = ['primary_organization_id', 'assignment_id', 'status', 'card_type', 'min_age', 'max_age', 'min_inserted_date', 'max_inserted_date', 'with_photo', 'with_passport', 'is_transfer', 'is_debtor', 'min_mark', 'max_mark', 'category_id'];
    ages: Array<number> = [];
    minInsertedParamBound: Function;
    maxInsertedParamBound: Function;
    data: SearchParams = {} as SearchParams;
    changed: State<boolean> = new State<boolean>(false);
    cleared: State<boolean> = new State<boolean>(true);

    constructor(changeDetectorRef: ChangeDetectorRef, public states: States, private utils: Utils) {
        super(changeDetectorRef);
        for (let i = 14; i < 32; i++) {
            this.ages.push(i);
        }
        this.minInsertedParamBound = this.minInsertedParam.bind(this);
        this.maxInsertedParamBound = this.maxInsertedParam.bind(this);
    }

    ngOnInit() {
        this.formControls = [];
        this.searchFiltersFieldNames.forEach(searchFilterFieldName => {
            this.formControls[searchFilterFieldName] = new FormControl();
            this.data[searchFilterFieldName] = null;
        });
        this.renderStates([this.states.user, this.states.searchParams, this.states.searchFiltersExpanded, this.changed, this.cleared]);
        this.data.primary_organization_id = null;
        this.formControls['primary_organization_id'].valueChanges.subscribe(value => {
            if (typeof (value) !== 'string') {
                this.formControls['primary_organization_id'].reset('', {emitEvent: false});
            }
            this.filterPrimaryOrganizations(value);
        });
        this.filterPrimaryOrganizations('');
        this.updatePrimaryOrganizationName();
    }

    updatePrimaryOrganizationName() {
        this.formControls['primary_organization_id'].reset((this.data.primary_organization_id !== null) ? this.states.primaryOrganizationsByID.value[this.data.primary_organization_id].name : '', {emitEvent: false});
    }

    filterPrimaryOrganizations(value: string) {
        if ((typeof (value) === 'string') && (this.states.primaryOrganizations.value)) {
            const lowerCaseValue = value.toLowerCase();
            let availablePrimaryOrganizations: Array<PrimaryOrganization> = [];
            if (this.states.user.value.hierarchy_level > 2) {
                availablePrimaryOrganizations = this.states.primaryOrganizations.value;
            } else {
                this.fillAvailablePrimaryOrganization(this.states.user.value.work_committee_id, availablePrimaryOrganizations);
            }
            this.filteredPrimaryOrganizations = availablePrimaryOrganizations.filter(primaryOrganization => {
                return primaryOrganization.name.toLowerCase().includes(lowerCaseValue);
            });
        }
    }

    fillAvailablePrimaryOrganization(committeeID: string, availablePrimaryOrganizations) {
        const primaryOrganizations = this.states.primaryOrganizationsByCommittee.value[committeeID];
        if (primaryOrganizations) {
            primaryOrganizations.forEach(primaryOrganization => {
                availablePrimaryOrganizations.push(primaryOrganization);
            });
        } else {
            const committee: Committee = this.states.committeesByID.value[committeeID];
            if (committee.children && committee.children.length) {
                committee.children.forEach(child => {
                    this.fillAvailablePrimaryOrganization(child.id, availablePrimaryOrganizations);
                });
            }
        }
    }

    primaryOrganizationFocused() {
        this.filterPrimaryOrganizations('');
        this.formControls['primary_organization_id'].reset('', {emitEvent: false});
    }

    primaryOrganizationBlurred() {
        this.updatePrimaryOrganizationName();
    }

    selectPrimaryOrganization(primaryOrganization: PrimaryOrganization, target: any) {
        this.setField('primary_organization_id', primaryOrganization ? primaryOrganization.id : null);
        this.updatePrimaryOrganizationName();
        target.blur();
    }

    setField(fieldName: string, value: any) {
        this.data[fieldName] = (value === false) ? null : value;
        this.updateStates();
    }

    updateStates() {
        let changed = false;
        let cleared = true;
        this.searchFiltersFieldNames.forEach(checkingFieldName => {
            if (this.data[checkingFieldName] !== this.states.searchParams.value[checkingFieldName]) {
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

    minInsertedParam(date: Moment): boolean {
        return this.data.max_inserted_date ? (date.toDate().getTime() < this.data.max_inserted_date.toDate().getTime()) : true;
    }

    maxInsertedParam(date: Moment): boolean {
        return this.data.min_inserted_date ? (date.toDate().getTime() > this.data.min_inserted_date.toDate().getTime()) : true;
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
        const searchParams: SearchParams = JSON.parse(JSON.stringify(this.states.searchParams.value));
        this.searchFiltersFieldNames.forEach(searchParamFieldName => {
            searchParams[searchParamFieldName] = this.data[searchParamFieldName];
            if (searchParamFieldName === 'min_inserted_date') {
                searchParams.min_inserted = this.data.min_inserted_date ? this.utils.convertToJAVADate(this.data.min_inserted_date) : null;
            }
            if (searchParamFieldName === 'max_inserted_date') {
                searchParams.max_inserted = this.data.max_inserted_date ? this.utils.convertToJAVADate(this.data.max_inserted_date) : null;
            }
        });
        this.states.searchParams.set(searchParams);
        this.updateStates();
    }
}
