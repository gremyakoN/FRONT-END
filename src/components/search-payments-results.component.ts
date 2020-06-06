import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {StateComponent} from '../classes/StateComponent';
import {States} from '../providers/states';
import {Server} from '../providers/server';
import {MatDialog} from '@angular/material';
import {ExportDialogComponent} from './export-dialog.component';
import {Utils} from '../providers/utils';
import {PaymentsReportComponent} from './payments-report.component';

@Component({
    selector: 'search-payments-results',
    templateUrl: 'search-payments-results.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SearchPaymentsResultsComponent extends StateComponent implements OnInit, OnDestroy {

    columns = [
        'card_number',
        'full_name',
        'committee_id',
        'amount',
        'period',
        'transaction_result',
        'initiator',
        'transaction_id'
    ];

    sortableColumns = [
        'card_number',
        'full_name',
        'amount',
        'transaction_result',
        'initiator',
        'transaction_id'
    ];

    constructor(changeDetectorRef: ChangeDetectorRef, public states: States, private server: Server, private dialog: MatDialog, private utils: Utils) {
        super(changeDetectorRef);
    }

    ngOnInit() {
        this.renderStates([this.states.searchPaymentsResult, this.states.searchingPayments]);
    }

    sortData(event) {
        const searchParams = JSON.parse(JSON.stringify(this.states.searchPaymentsParams.value));
        if (event.direction) {
            searchParams.order_by = event.active;
            searchParams.order_type = event.direction;
        } else {
            searchParams.order_by = null;
            searchParams.order_type = null;
        }
        this.states.searchPaymentsParams.set(searchParams);
    }

    getPaginationParams(): Array<number> {
        const count = this.states.searchPaymentsResult.value.count;
        const pageSize = this.states.searchPaymentsParams.value.page_size;
        const pageNumber = this.states.searchPaymentsParams.value.page_number;
        return [(pageNumber - 1) * pageSize, Math.min(pageNumber * pageSize, count), count];
    }

    prevPage() {
        this.states.searchPaymentsParams.setField('page_number', this.states.searchPaymentsParams.value.page_number - 1);
    }

    nextPage() {
        this.states.searchPaymentsParams.setField('page_number', this.states.searchPaymentsParams.value.page_number + 1);
    }

    export() {
        this.dialog.open(ExportDialogComponent, {
            disableClose: true,
            panelClass: 'small-popup'
        }).afterClosed().subscribe(result => {
            if (result) {
                this.exportPayments();
            }
        });
    }

    exportPayments() {
        this.states.curtainVisible.set(true);
        this.server.exportPayments(this.states.searchPaymentsParams.value).then(result => {
            const a = document.createElement('a') as any;
            a.style = 'display: none';
            a.href = window.URL.createObjectURL(new Blob(['\ufeff' + result], {type: 'text/csv;charset=UTF-8'}));
            const date = new Date();
            a.download = 'ExportPayments_' + date.toLocaleDateString('ru').replace('.', '_') + '_' + date.toLocaleTimeString('ru').replace(':', '_') + '.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            this.states.curtainVisible.set(false);
        });
    }

    report() {
        this.dialog.open(PaymentsReportComponent, {
            disableClose: true,
            panelClass: 'big-popup'
        });
    }
}
