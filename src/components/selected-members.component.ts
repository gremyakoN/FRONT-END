import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {StateComponent} from '../classes/StateComponent';
import {Server} from '../providers/server';
import {States} from '../providers/states';
import {State} from '../classes/State';

@Component({
    selector: 'selected-members',
    templateUrl: 'selected-members.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SelectedMembersComponent extends StateComponent implements OnInit {

    actions: Array<string> = [];
    actionsVisible: State<boolean> = new State<boolean>(false);
    selectedMembersIDsChangedBound: Function;

    constructor(private server: Server, public states: States, changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
        this.selectedMembersIDsChangedBound = this.selectedMembersIDsChanged.bind(this);
    }

    ngOnInit() {
        this.renderStates([this.actionsVisible, this.states.selectedMembersIDs]);
        this.states.selectedMembersIDs.subscribe(this.selectedMembersIDsChangedBound);
    }

    selectedMembersIDsChanged() {
        this.actions = [];
        if (this.states.searchParams.value.is_debtor) {
            this.actions.push('payedWithCash');
        }
        if ((this.states.user.value.hierarchy_level === 1) || (this.states.user.value.hierarchy_level === 4)) {
            this.actions.push('changeCategory');
        }

        this.actions.push('applyPromotion');
        if (this.states.user.value.is_admin) {
            this.actions.push('checkIn');
        }
    }

    clearMembers() {
        this.states.selectedMembersIDs.set([]);
    }

    actionSelected(action: string) {
        this.states.selectedMembersAction.set(action);
    }

}
