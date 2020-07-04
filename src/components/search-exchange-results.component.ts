import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {StateComponent} from '../classes/StateComponent';
import {States} from '../providers/states';
import {Server} from '../providers/server';
import {MatDialog} from '@angular/material';
import {State} from '../classes/State';
import {SearchFileParams} from '../classes/Interfaces';

@Component({
    selector: 'search-exchange-results',
    templateUrl: 'search-exchange-results.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SearchExchangeResultsComponent extends StateComponent implements OnInit, OnDestroy {

    sortableColumns = [
        'ID',
        'NAME',
        'EXCHANGEDATE',
        'FILECOUNT',
        'FILEFORMED',
        'RECCOUNT',
        'PARENTID'
    ];

    updateExchangeColumnsBound: Function;
    columns: State<Array<string>> = new State<Array<string>>(null);

    @Input() colExchanges: Array<string> = [
        'checkbox',
        'ID',
        'NAME',
        'EXCHANGEDATE',
        'FILECOUNT',
        'FILEFORMED',
        'RECCOUNT',
        'PARENTID'
    ];

    @Input() showButtons = true;
    @Input() showSelectedExchanges = true;
    @Input() resultState;
    @Input() paramsState;
    @Input() searchingState;
    @Input() clickableRows = true;

    constructor(changeDetectorRef: ChangeDetectorRef, public states: States, private server: Server, private dialog: MatDialog) {
        super(changeDetectorRef);
        this.updateExchangeColumnsBound = this.updateExchangeColumns.bind(this);
    }

    ngOnInit() {
        this.renderStates([this.columns, this.states.user, this.resultState, this.searchingState, this.states.selectedExchangesIDs]);
        this.states.user.subscribe(this.updateExchangeColumnsBound);
        this.updateExchangeColumns();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.states.user.unsubscribe(this.updateExchangeColumnsBound);
    }

    updateExchangeColumns() {
        if (this.states.user.value) {
            const checkboxIndex: number = this.colExchanges.indexOf('checkbox');
            const columns = JSON.parse(JSON.stringify(this.colExchanges));
            if (!this.states.user.value.is_admin && (checkboxIndex !== -1)) {
                columns.splice(checkboxIndex, 1);
            }
            this.columns.set(columns);
        }
    }

    sortData(event) {
        const searchParams = JSON.parse(JSON.stringify(this.paramsState.value));
        alert(JSON.stringify(this.paramsState.value));
        if (event.direction) {
            searchParams.order_by = event.active;
            searchParams.order_type = event.direction;
        } else {
            searchParams.order_by = null;
            searchParams.order_type = null;
        }
        this.paramsState.set(searchParams);
    }

    addExchange() {
        /*
        this.dialog.open(MemberDetailsComponent, {
            disableClose: true,
            panelClass: 'big-popup'
        }).afterClosed().subscribe(this.memberEditedBound);
        */
    }

    rowClicked(event, row) {
        if (event.target.tagName === 'TD') {
            this.states.curtainVisible.set(true);
            this.states.searchFileParams.set({
                fromdate: null,
                fromdate_moment: null,
                todate: null,
                todate_moment: null,
                exchange_groupid: null,
                exchange_typeid: null,
                exchangeid: row.ID,
                fileid: null,
                order_by: null,
                order_type: null,
                page_number: 1,
                page_size: 0
            } as SearchFileParams);
            this.server.getFiles(this.states.searchFileParams.value).then(response => {
                this.states.searchFileResult.set(response);
                this.states.selectedMenu.set('files');
            }).catch(error => {
                alert(error.message);
            }).finally(() => {
                this.states.curtainVisible.set(false);
            });
        }
    }

    checkboxChanged(element, checked) {
        const arr = this.states.selectedExchangesIDs.value;
        if (checked) {
            if (arr.indexOf(element.ID) === -1) {
                arr.push(element.ID);
            }
        } else {
            if (arr.indexOf(element.ID) !== -1) {
                arr.splice(arr.indexOf(element.ID), 1);
            }
        }
        this.states.selectedExchangesIDs.emit();
    }

    getPaginationParams(): Array<number> {
        const count = this.resultState.value.count;
        const pageSize = this.paramsState.value.page_size;
        const pageNumber = this.paramsState.value.page_number;
        return [(pageNumber - 1) * pageSize, Math.min(pageNumber * pageSize, count), count];
    }

    prevPage() {
        this.paramsState.setField('page_number', this.paramsState.value.page_number - 1);
    }

    nextPage() {
        this.paramsState.setField('page_number', this.paramsState.value.page_number + 1);
    }

    export() {
        /*
        this.dialog.open(ExportDialogComponent, {
            disableClose: true,
            panelClass: 'small-popup'
        }).afterClosed().subscribe(result => {
            if (result) {
                this.exportMembers();
            }
        });
        */
    }
/*


    exportMembers() {
        this.states.curtainVisible.set(true);
        this.server.exportMembers(this.paramsState.value).then(result => {
            const a = document.createElement('a') as any;
            a.style = 'display: none';
            a.href = window.URL.createObjectURL(new Blob(['\ufeff' + result], {type: 'text/csv;charset=UTF-8'}));
            const date = new Date();
            a.download = 'ExportMembers_' + date.toLocaleDateString('ru').replace('.', '_') + '_' + date.toLocaleTimeString('ru').replace(':', '_') + '.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            this.states.curtainVisible.set(false);
        });
    }
*/
}
