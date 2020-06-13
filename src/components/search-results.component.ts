import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {StateComponent} from '../classes/StateComponent';
import {States} from '../providers/states';
import {Server} from '../providers/server';
import {MatDialog} from '@angular/material';
// import {ExportDialogComponent} from './export-dialog.component';
// import {MemberDetailsComponent} from './member-details.component';
import {State} from '../classes/State';

@Component({
    selector: 'search-results',
    templateUrl: 'search-results.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SearchResultsComponent extends StateComponent implements OnInit, OnDestroy {

    sortableColumns = [
        'ID',
        'PARENTID'
    ];

    updateColumnsBound: Function;
    //memberEditedBound: any;
    columns: State<Array<string>> = new State<Array<string>>(null);

    @Input() allColumns: Array<string> = [
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
        this.updateColumnsBound = this.updateColumns.bind(this);
        //this.memberEditedBound = this.memberEdited.bind(this);
    }

    ngOnInit() {
        this.renderStates([this.columns, this.states.user, this.resultState, this.searchingState, this.states.selectedExchangesIDs]);
        this.states.user.subscribe(this.updateColumnsBound);
        this.updateColumns();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.states.user.unsubscribe(this.updateColumnsBound);
    }

    updateColumns() {
        if (this.states.user.value) {
            const checkboxIndex: number = this.allColumns.indexOf('checkbox');
            const columns = JSON.parse(JSON.stringify(this.allColumns));
            if (!this.states.user.value.is_admin && (checkboxIndex !== -1)) {
                columns.splice(checkboxIndex, 1);
            }
            this.columns.set(columns);
        }
    }

    sortData(event) {
        const searchParams = JSON.parse(JSON.stringify(this.paramsState.value));
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
/*
    rowClicked(event, row) {
        if (event.target.tagName === 'TD') {
            this.states.curtainVisible.set(true);
            this.server.getMember(row.id).then(result => {
                this.dialog.open(MemberDetailsComponent, {
                    disableClose: true,
                    panelClass: 'big-popup',
                    data: result
                }).afterClosed().subscribe(this.memberEditedBound);
            }).catch(error => {
                alert(error.message);
            }).finally(() => {
                this.states.curtainVisible.set(false);
            });
        }
    }
*/

/*


    memberEdited(member) {
        if (member) {
            this.paramsState.set(this.paramsState.value);
            if (member.id === this.states.user.value.user_id) {
                this.server.getUser().then(userResult => {
                    if (userResult.user.photo_id) {
                        this.server.loadImage(userResult.user.photo_id).then(response => {
                            userResult.user.photo = response.image;
                            this.states.user.set(userResult.user);
                        });
                    } else {
                        this.states.user.set(userResult.user);
                    }
                });
            }
        }
    }


*/
    checkboxChanged(element, checked) {
        const arr = this.states.selectedExchangesIDs.value;
        if (checked) {
            if (arr.indexOf(element.id) === -1) {
                arr.push(element.id);
            }
        } else {
            if (arr.indexOf(element.id) !== -1) {
                arr.splice(arr.indexOf(element.id), 1);
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
