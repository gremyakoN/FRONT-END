import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {StateComponent} from '../classes/StateComponent';
import {MatSort, MatTableDataSource} from '@angular/material';
import {State} from '../classes/State';

@Component({
    selector: 'table-sort',
    templateUrl: 'table-sort.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class TableSortComponent extends StateComponent implements OnInit, OnDestroy {

    @Input() columns: Array<string>;

    @Input() dataState: State<any>;

    @Input() labelPrefix: string;

    @Input() clickable: string;

    @Output() clicked = new EventEmitter();

    @ViewChild(MatSort) sort: MatSort;

    dataSource: MatTableDataSource<any>;
    updateDataSourceBound: Function;

    constructor(changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
        this.updateDataSourceBound = this.updateDataSource.bind(this);
    }

    ngOnInit() {
        this.renderStates([this.dataState]);
        this.dataState.subscribe(this.updateDataSourceBound);
        this.updateDataSource();
    }

    ngOnDestroy() {
        this.dataState.unsubscribe(this.updateDataSourceBound);
    }

    updateDataSource() {
        if (this.dataState.value) {
            this.dataSource = new MatTableDataSource(this.dataState.value);
            this.dataSource.sort = this.sort;
        }
    }

    rowClicked(row) {
        this.clicked.emit(row);
    }

}
