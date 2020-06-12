import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {StateComponent} from '../classes/StateComponent';
import {ExchangeType, SearchExchangeParams} from '../classes/Interfaces';
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

    //filteredPrimaryOrganizations: Array<PrimaryOrganization>;
    filteredExchangeTypes: Array<ExchangeType>;
    formControls: Array<FormControl>;
    //searchFiltersFieldNames: Array<string> = ['primary_organization_id', 'assignment_id', 'status', 'card_type', 'min_age', 'max_age', 'min_inserted_date', 'max_inserted_date', 'with_photo', 'with_passport', 'is_transfer', 'is_debtor', 'min_mark', 'max_mark', 'category_id'];
    searchFiltersFieldNames: Array<string> = ['exchange_typeid'/*, 'exchangeid', 'fileid', 'filename'*/];
    ages: Array<number> = [];
    minInsertedParamBound: Function;
    maxInsertedParamBound: Function;
    data: SearchExchangeParams = {} as SearchExchangeParams;
    changed: State<boolean> = new State<boolean>(false);
    cleared: State<boolean> = new State<boolean>(true);

    constructor(changeDetectorRef: ChangeDetectorRef, public states: States, private utils: Utils) {
        super(changeDetectorRef);
    }

    ngOnInit() {
        this.formControls = [];
        this.searchFiltersFieldNames.forEach(searchFilterFieldName => {
            this.formControls[searchFilterFieldName] = new FormControl();
            this.data[searchFilterFieldName] = null;
        });
        this.renderStates([this.states.user, this.states.searchExchangeParams, this.states.searchExchangeFiltersExpanded, this.changed, this.cleared]);
    }

    setField(fieldName: string, value: any) {
        this.data[fieldName] = (value === false) ? null : value;
        this.updateStates();
    }

    updateStates() {
        let changed = false;
        let cleared = true;
        this.searchFiltersFieldNames.forEach(checkingFieldName => {
            if (this.data[checkingFieldName] !== this.states.searchExchangeParams.value[checkingFieldName]) {
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
        const searchParams: SearchExchangeParams = JSON.parse(JSON.stringify(this.states.searchExchangeParams.value));
        this.searchFiltersFieldNames.forEach(searchParamFieldName => {
            searchParams[searchParamFieldName] = this.data[searchParamFieldName];
            if (searchParamFieldName === 'fromdate') {
                searchParams.fromdate_str = this.data.fromdate ? this.utils.convertToJAVADate(this.data.fromdate) : null;
            }
            if (searchParamFieldName === 'todate') {
                searchParams.todate_str = this.data.todate ? this.utils.convertToJAVADate(this.data.todate) : null;
            }
        });
        this.states.searchExchangeParams.set(searchParams);
        this.updateStates();
    }
}
