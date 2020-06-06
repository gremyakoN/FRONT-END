import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {StateComponent} from '../classes/StateComponent';
import {Server} from '../providers/server';
import {States} from '../providers/states';
import {Utils} from '../providers/utils';
import {MatDialog} from '@angular/material';
import {ChangePasswordComponent} from './change-password.component';

@Component({
    selector: 'user-info',
    templateUrl: 'user-info.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class UserInfoComponent extends StateComponent implements OnInit {

    constructor(private server: Server, public states: States, public utils: Utils, private dialog: MatDialog, public changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }

    ngOnInit() {
        this.renderStates([this.states.user]);
    }

    logout() {
        this.server.logout().then(() => {
            this.states.loggedIn.set(null);
        }).catch(error => {
            alert(error.message);
        });
    }

    changePassword() {
        this.dialog.open(ChangePasswordComponent, {
            disableClose: true,
            panelClass: 'small-popup'
        }).afterClosed().subscribe(result => {
            if (result) {
                this.states.curtainVisible.set(true);
                this.server.changePassword(result).catch(error => {
                    alert(error.message);
                }).finally(() => {
                    this.states.curtainVisible.set(false);
                });
            }
        });
    }

}
