import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {StateComponent} from '../classes/StateComponent';
import {Server} from '../providers/server';
import {States} from '../providers/states';
import {State} from '../classes/State';

@Component({
    selector: 'selected-files',
    templateUrl: 'selected-files.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SelectedFilesComponent extends StateComponent implements OnInit {

    actions: Array<string> = [];
    actionsVisible: State<boolean> = new State<boolean>(false);
    selectedFilesIDsChangedBound: Function;

    constructor(private server: Server, public states: States, changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
        this.selectedFilesIDsChangedBound = this.selectedFilesIDsChanged.bind(this);
    }

    ngOnInit() {
        this.renderStates([this.actionsVisible, this.states.selectedFilesIDs]);
        this.states.selectedFilesIDs.subscribe(this.selectedFilesIDsChangedBound);
    }

    selectedFilesIDsChanged() {
        this.actions = [];
        this.actions.push('delete');
        this.actions.push('download');
    }

    clearFiles() {
        this.states.selectedFilesIDs.set([]);
    }

    actionSelected(action: string) {
        this.states.selectedFilesAction.set(action);
    }

}
