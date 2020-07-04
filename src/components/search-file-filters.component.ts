import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {StateComponent} from '../classes/StateComponent';
import {SearchFileParams} from '../classes/Interfaces';
import {States} from '../providers/states';
import {FormControl} from '@angular/forms';
import {State} from '../classes/State';
import {Utils} from '../providers/utils';

@Component({
    selector: 'search-file-filters',
    templateUrl: 'search-file-filters.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SearchFileFiltersComponent extends StateComponent implements OnInit {

    formControls: Array<FormControl>;
    searchFileFiltersFieldNames: Array<string> = ['exchange_typeid', 'exchangeid', 'fileid'];
    data: SearchFileParams = {} as SearchFileParams;
    changed: State<boolean> = new State<boolean>(false);
    cleared: State<boolean> = new State<boolean>(true);

    constructor(changeDetectorRef: ChangeDetectorRef, public states: States, private utils: Utils) {
        super(changeDetectorRef);
    }

    ngOnInit() {
        this.formControls = [];
        this.searchFileFiltersFieldNames.forEach(searchFileFilterFieldNames => {
            this.formControls[searchFileFilterFieldNames] = new FormControl();
            this.data[searchFileFilterFieldNames] = null;
        });
        this.renderStates([this.states.user, this.states.searchFileParams, this.states.searchFileFiltersExpanded, this.changed, this.cleared]);
    }

    setField(fieldName: string, value: any) {
        this.data[fieldName] = (value === false) ? null : value;
        this.updateStates();
    }

    updateStates() {
        let changed = false;
        let cleared = true;
        this.searchFileFiltersFieldNames.forEach(checkingFieldName => {
            if (this.data[checkingFieldName] !== this.states.searchFileParams.value[checkingFieldName]) {
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

    removeSearchParam(searchFileParamFieldName: string, apply: boolean = true) {
        this.data[searchFileParamFieldName] = null;
        this.formControls[searchFileParamFieldName].reset('', {emitEvent: false});
        if (apply) {
            this.applySearchParams();
        } else {
            this.updateStates();
        }
    }

    clearAllSearchParams() {
        this.searchFileFiltersFieldNames.forEach(searchFileParamFieldName => {
            this.removeSearchParam(searchFileParamFieldName, false);
        });
        this.updateStates();
    }

    applySearchParams() {
        this.searchFileFiltersFieldNames.forEach(searchFileParamFieldName => {
            this.states.searchFileParams.setField(searchFileParamFieldName, this.data[searchFileParamFieldName]);
        });
        this.updateStates();
    }
}
