import {Component, ElementRef, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {BigPopupComponent} from './big-popup.component';
import {States} from '../providers/states';
import {Server} from '../providers/server';
import {Utils} from '../providers/utils';
import * as momentNs from 'moment';
const moment = momentNs;

@Component({
    selector: 'payments-report',
    templateUrl: 'payments-report.component.html'
})

export class PaymentsReportComponent extends BigPopupComponent implements OnInit {

    FIELDS = ['period'];
    years: Array<number>;
    year: number;
    startDate: string;
    endDate: string;
    currentDate: string;
    columns: Array<string>;
    report: Array<any>;
    categories: Array<string>;
    printStyles = '.report {\n' +
        '            font-family: "Lucida Console", "Courier New";\n' +
        '            font-size: 12px;\n' +
        '        }\n' +
        '\n' +
        '        .reportHeaderRight, .reportHeaderCenter {\n' +
        '            font-weight: bold;\n' +
        '            padding: 16px;\n' +
        '        }\n' +
        '\n' +
        '        .reportHeaderRight {\n' +
        '            text-align: right;\n' +
        '        }\n' +
        '\n' +
        '        .reportHeaderCenter {\n' +
        '            font-size: 14px;\n' +
        '            text-align: center;\n' +
        '        }\n' +
        '\n' +
        '        .reportTable, .reportTable td, .reportTable th {\n' +
        '            border: 1px solid black;\n' +
        '            border-collapse: collapse;\n' +
        '        }\n' +
        '\n' +
        '        .reportTable {\n' +
        '            width: 100%;\n' +
        '        }\n' +
        '\n' +
        '        .reportTable tr:last-child {\n' +
        '            font-weight: bold;\n' +
        '        }\n' +
        '\n' +
        '        .reportTable td, .reportTable th {\n' +
        '            padding: 4px;\n' +
        '        }\n' +
        '\n' +
        '        .reportTable th {\n' +
        '            text-align: center;\n' +
        '        }\n' +
        '\n' +
        '        .reportTable th:first-child {\n' +
        '            white-space: nowrap;\n' +
        '        }\n' +
        '\n' +
        '        .reportTable td {\n' +
        '            text-align: right;\n' +
        '        }\n' +
        '\n' +
        '        .reportTable td:nth-child(1) {\n' +
        '            text-align: center;\n' +
        '        }\n' +
        '\n' +
        '        .reportTable td:nth-child(2) {\n' +
        '            text-align: left;\n' +
        '        }\n' +
        '\n' +
        '        .footer {\n' +
        '            padding: 16px;\n' +
        '        }';

    constructor(public dialogRef: MatDialogRef<any>, private elementRef: ElementRef, public states: States, private server: Server, private utils: Utils) {
        super(dialogRef);
    }

    ngOnInit() {
        super.ngOnInit();
        this.years = [];
        const currentYear: number = new Date().getFullYear();
        let year = 2010;
        do {
            this.years.push(year++);
        } while (year <= currentYear);
        this.formControls['period'].reset(currentYear);
        this.periodSelected(currentYear);
    }

    periodSelected(year: number) {
        this.states.curtainVisible.set(true);
        const from = moment(0);
        from.year(year);
        let to = moment(0);
        to.year(year + 1);
        to.subtract(1, 'days');
        const now = moment();
        if (now.isBefore(to)) {
            to = now;
        }
        this.server.getReport(this.utils.convertToJAVADate(from), this.utils.convertToJAVADate(to)).then(response => {
            this.startDate = from.toDate().toLocaleDateString('ru');
            this.endDate = to.toDate().toLocaleDateString('ru');
            this.currentDate = now.toDate().toLocaleDateString('ru');
            this.year = year;
            this.report = response.report;
            this.categories = [];
            this.report.forEach((line, i) => {
                const fields = Object.keys(line);
                fields.forEach(field => {
                   if (field.indexOf('count_cat_') === 0) {
                       const categoryID: string = field.split('_')[2];
                       if (this.categories.indexOf(categoryID) === -1) {
                           this.categories.push(categoryID);
                       }
                   }
                });
            });
            this.columns = ['row_num', 'name', 'count_on_start', 'count_on_finish', 'count_activated', 'count_moved_in'];
            this.categories.forEach(category => {
                this.columns.push('count_cat_' + category);
                this.columns.push('amount_cat_' + category);
            });
            this.columns = this.columns.concat(['count_excluded_without_payment', 'amount_planned', 'amount_percent']);
        }).catch(error => {
            alert(error.message);
        }).finally(() => {
            this.states.curtainVisible.set(false);
        });
    }

    printTable() {
        this.utils.printHTML('<div class="report">' + this.elementRef.nativeElement.querySelector('[report]').innerHTML + '</div>', this.printStyles);
    }

}
