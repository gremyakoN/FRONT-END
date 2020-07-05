import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {StateComponent} from '../classes/StateComponent';
import {States} from '../providers/states';
import {Server} from '../providers/server';
import {MatDialog} from '@angular/material';
// import {ExportDialogComponent} from './export-dialog.component';
import {State} from '../classes/State';
// import {SearchExchangeParams} from '../classes/Interfaces';
import {UploadFileComponent} from './upload-file.component';
import {ExportDialogComponent} from './export-dialog.component';

@Component({
    selector: 'search-file-results',
    templateUrl: 'search-file-results.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SearchFileResultsComponent extends StateComponent implements OnInit, OnDestroy {

    sortableColumns = [
        'ID',
        'CODE',
        'FILENAME',
        'FILEDATE',
        'MODIFDATE',
        'RECCOUNT',
        'ERRCOUNT'
    ];

    updateColumnsBound: Function;
    filesEditedBound: any;
    columns: State<Array<string>> = new State<Array<string>>(null);

    @Input() colFiles: Array<string> = [
            'checkbox',
            'ID',
            'NAME',
            //'CODE',
            'FILENAME',
            'FILEDATE',
            //'MODIFDATE',
            'FILETYPE',
            //'EXCHTYPE',
            //'FILECATEGORYID',
            //'MAILID',
            //'MAILNAME',
            //'MAILTEXT',
            //'FLKID',
            'RECCOUNT',
            //'DIRECTIONID',
            'ERRCOUNT'
            //'ISACK1',
            //'ISACK2',
            //'ERRCHECKED',
            //'PARENTID',
            //'PARENT_EXCHANGEID',
            //'PROCESSSTATEID',
            //'FILESIZE'
        ];

    @Input() showButtons = true;
    @Input() showSelectedFiles = true;
    @Input() resultState;
    @Input() paramsState;
    @Input() searchingState;
    @Input() clickableRows = true;

    constructor(changeDetectorRef: ChangeDetectorRef, public states: States, private server: Server, private dialog: MatDialog) {
        super(changeDetectorRef);
        this.updateColumnsBound = this.updateColumns.bind(this);
        this.filesEditedBound = this.filesEdited.bind(this);
    }

    ngOnInit() {
        this.renderStates([this.columns, this.states.user, this.resultState, this.searchingState, this.states.selectedFilesIDs]);
        this.states.user.subscribe(this.updateColumnsBound);
        this.updateColumns();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.states.user.unsubscribe(this.updateColumnsBound);
    }

    updateColumns() {
        if (this.states.user.value) {
            const checkboxIndex: number = this.colFiles.indexOf('checkbox');
            const columns = JSON.parse(JSON.stringify(this.colFiles));
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

    addFile() {
        this.states.curtainVisible.set(true);
        this.server.getFileTypes(this.states.searchFileParams.value.exchangeid).then(response => {
            this.dialog.open(UploadFileComponent, {
                disableClose: true,
                panelClass: 'small-popup',
                data: response
            }).afterClosed().subscribe(this.filesEditedBound);
        }).catch(error => {
            alert(error.message);
        }).finally(() => {
            this.states.curtainVisible.set(false);
        });
    }

    rowClicked(event, row) {
        if (event.target.tagName === 'TD') {
            this.checkboxChanged(row, (this.states.selectedFilesIDs.value.indexOf(row.ID) === -1));

            /*
            this.states.curtainVisible.set(true);
            this.server.getExchangeFiles(row.ID).then(response => {
                // this.states.exchangeFilesResult.set(response);
                response.exchangeId = row.ID;
                this.dialog.open(SearchFilesResultComponent, {
                    disableClose: true,
                    panelClass: 'big-popup',
                    data: response
                }).afterClosed().subscribe(this.filesEditedBound);
            }).catch(error => {
                alert(error.message);
            }).finally(() => {
                this.states.curtainVisible.set(false);
            });
            */
        }
    }


    filesEdited() {
        /*
        this.server.getExchanges(SearchExchangeParams).then(userResult => {
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
        */
    }

    checkboxChanged(element, checked) {
        const arr = this.states.selectedFilesIDs.value;
        if (checked) {
            if (arr.indexOf(element.ID) === -1) {
                arr.push(element.ID);
            }
        } else {
            if (arr.indexOf(element.ID) !== -1) {
                arr.splice(arr.indexOf(element.ID), 1);
            }
        }
        this.states.selectedFilesIDs.emit();
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
        this.dialog.open(ExportDialogComponent, {
            disableClose: true,
            panelClass: 'small-popup'
        }).afterClosed().subscribe(result => {
            if (result) {
                this.exportList();
            }
        });
    }

    exportList() {
        this.states.curtainVisible.set(true);
        this.server.exportFilesList(this.paramsState.value).then(() => {
        }).catch(error => {
            alert(error.message);
        }).finally(() => {
            this.states.curtainVisible.set(false);
        });
    }
}
