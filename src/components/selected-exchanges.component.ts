import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {StateComponent} from '../classes/StateComponent';
import {Server} from '../providers/server';
import {States} from '../providers/states';
import {State} from '../classes/State';

@Component({
    selector: 'selected-exchanges',
    templateUrl: 'selected-exchanges.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SelectedExchangesComponent extends StateComponent implements OnInit {

    actions: Array<string> = [];
    actionsVisible: State<boolean> = new State<boolean>(false);
    selectedExchangesIDsChangedBound: Function;

    constructor(private server: Server, public states: States, changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
        this.selectedExchangesIDsChangedBound = this.selectedExchangesIDsChanged.bind(this);
    }

    ngOnInit() {
        this.renderStates([this.actionsVisible, this.states.selectedExchangesIDs]);
        this.states.selectedExchangesIDs.subscribe(this.selectedExchangesIDsChangedBound);
    }

    selectedExchangesIDsChanged() {
        this.actions = [];
        this.actions.push('delete');
        /*if ((this.states.user.value.hierarchy_level === 1) || (this.states.user.value.hierarchy_level === 4)) {
            this.actions.push('changeCategory');
        }*/
/*
        this.actions.push('applyPromotion');
        if (this.states.user.value.is_admin) {
            this.actions.push('checkIn');
        }
*/
    }

    clearExchanges() {
        this.states.selectedExchangesIDs.set([]);
    }

    actionSelected(action: string) {
        this.states.selectedExchangesAction.set(action);
    }

}
