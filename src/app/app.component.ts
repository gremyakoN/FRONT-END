import {ApplicationRef, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Utils} from '../providers/utils';
import {StateComponent} from '../classes/StateComponent';
import {States} from '../providers/states';
import {Server} from '../providers/server';
import {FormControl, Validators} from '@angular/forms';
import {MatBottomSheet, MatDialog} from '@angular/material';
import {ResetPasswordComponent} from '../components/reset-password.component';
import {
    CompanyRegion,
    ExchangeType, ExchangeGroup,
    SearchExchangeParams,
    SearchFileParams
} from '../classes/Interfaces';
import * as moment from 'moment';
import {Moment} from 'moment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})

export class AppComponent extends StateComponent implements OnInit {

    menuItems: Array<string> = ['exchanges','files'/*,'compregion'*/];

    runTickBound: FrameRequestCallback;

    usernameFormControl: FormControl;
    passwordFormControl: FormControl;

    fromDateDefault: string;
    toDateDefault: string;

    searchExchangesBound: Function;
    selectedExchangesActionChangedBound: Function;
    minDateExchangesParamBound: Function;
    maxDateExchangesParamBound: Function;

    searchFilesBound: Function;
    selectedFilesActionChangedBound: Function;
    minDateFilesParamBound: Function;
    maxDateFilesParamBound: Function;

    constructor(private app: ApplicationRef, public states: States, private utils: Utils, private server: Server, private bottomSheet: MatBottomSheet, private dialog: MatDialog, changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
        this.runTickBound = this.runTick.bind(this);

        this.searchExchangesBound = this.searchExchanges.bind(this);
        this.selectedExchangesActionChangedBound = this.selectedExchangesActionChanged.bind(this);
        this.minDateExchangesParamBound = this.minDateExchangesParam.bind(this);
        this.maxDateExchangesParamBound = this.maxDateExchangesParam.bind(this);

        this.searchFilesBound = this.searchFiles.bind(this);
        this.selectedFilesActionChangedBound = this.selectedFilesActionChanged.bind(this);
        this.minDateFilesParamBound = this.minDateFilesParam.bind(this);
        this.maxDateFilesParamBound = this.maxDateFilesParam.bind(this);

        history.pushState(null, null, location.href);
        window.onpopstate = () => history.go(1);
    }

    ngOnInit() {
        window.addEventListener('beforeunload', ev => {
            return ev.returnValue = this.states.texts.value.reloadQuestion[this.states.lang.value];
        });
        this.renderStates([
            this.states.lang,
            this.states.initComplete,
            this.states.loginErrorVisible,
            this.states.selectedMenu,
            this.states.selectedExchangesIDs,
            this.states.selectedFilesIDs
        ]);
        Promise.all([
            this.server.loadTexts(),
            this.server.loadConfig()
        ]).then(data => {
            this.states.texts.set(data[0]);
            this.states.config.set(data[1]);
            this.states.lang.set(data[1].defaultLang);
            this.states.initComplete.set(true);
            const savedLogId: string = window.localStorage.getItem('logid');
            const savedToken: string = window.localStorage.getItem('token');
            const savedCompanyId: string = window.localStorage.getItem('companyid');
            const savedRegionId: string = window.localStorage.getItem('regionid');
            // const savedToken = null;
            if (savedLogId != null) {
                this.states.curtainVisible.set(true);
                this.server.logid = savedLogId;
                this.server.token = savedToken;
                this.server.companyid = savedCompanyId;
                this.server.regionid = savedRegionId;
                window.localStorage.removeItem('logid');
                window.localStorage.removeItem('token');
                window.localStorage.removeItem('companyid');
                window.localStorage.removeItem('regionid');
                this.server.refresh().then(response => {
                    this.afterLogin(response);
                }).catch(error => {
                    alert(error.message);
                }).finally(() => {
                    this.states.curtainVisible.set(false);
                });
            }
        });
        this.usernameFormControl = new FormControl('', [
            Validators.required
        ]);
        this.passwordFormControl = new FormControl('', [
            Validators.required
        ]);
/*
        this.usernameFormControl = new FormControl('gremyako', [
            Validators.required,
        ]);
        this.passwordFormControl = new FormControl('pocv1bvq', [
            Validators.required
        ]);
*/
        this.states.searchExchangeParams.set({
            fromdate: null,
            fromdate_moment: null,
            todate: null,
            todate_moment: null,
            exchange_groupid: null,
            exchange_typeid: null,
            order_by: null,
            order_type: null,
            page_number: 1,
            page_size: 0
        } as SearchExchangeParams);

        this.states.searchFileParams.set({
            fromdate: null,
            fromdate_moment: null,
            todate: null,
            todate_moment: null,
            exchange_groupid: null,
            exchange_typeid: null,
            exchangeid: null,
            fileid: null,
            order_by: null,
            order_type: null,
            page_number: 1,
            page_size: 0
        } as SearchFileParams);

        document.body.appendChild(document.body.querySelector('div[curtain]'));
        this.states.selectedMenu.set('exchanges');
    }

    runTick() {
        this.app.tick();
        window.requestAnimationFrame(this.runTickBound);
    }

    login() {
        if (this.usernameFormControl.valid && this.passwordFormControl.valid) {
            this.states.curtainVisible.set(true);
            this.server.login(this.usernameFormControl.value, this.passwordFormControl.value).then(response => {
                this.afterLogin(response);
            }).catch(error => {
                switch (error.code) {
                    case -32005:
                        this.forgotPassword(false);
                        break;
                    case -1:
                    case -32006:
                        this.showLoginError(error.code);
                        break;
                    default:
                        alert(error.message);
                        break;
                }
                console.error(error);
                this.states.curtainVisible.set(false);
            });
        }
    }

    afterLogin(loginResponse) {
        window.localStorage.setItem('logid', loginResponse.logid);
        this.server.logid = loginResponse.logid;
        window.localStorage.setItem('token', loginResponse.token);
        this.server.token = loginResponse.token;
        window.localStorage.setItem('companyid', loginResponse.user.companyid);
        this.server.companyid = loginResponse.user.companyid;
        window.localStorage.setItem('regionid', loginResponse.user.regionid);
        this.server.regionid = loginResponse.user.regionid;

        // update all dicts!
        this.updateCompanyRegion(loginResponse.companyregion || []);
        this.updateExchangeGroups(loginResponse.exchange_groups || []);
        this.updateExchangeTypes(loginResponse.exchange_types || []);

        this.fromDateDefault = this.utils.convertToJAVADate(moment().add(-this.states.config.value.searchDays, 'days'));
        this.toDateDefault = this.utils.convertToJAVADate(moment());

        this.states.searchExchangeParams.setField('page_size', this.states.config.value.searchPageSize);
        this.states.searchExchangeParams.setField('exchange_groupid', this.states.config.value.defaultGroupId);
        this.states.searchExchangeParams.setField('fromdate_moment', moment().add(-this.states.config.value.searchDays, 'days'));
        this.states.searchExchangeParams.setField('fromdate', this.fromDateDefault);
        this.states.searchExchangeParams.setField('todate_moment', moment());
        this.states.searchExchangeParams.setField('todate', this.toDateDefault);
        // this.states.searchExchangeParams.subscribe(this.searchExchangesBound());
        this.states.selectedExchangesAction.subscribe(this.selectedExchangesActionChangedBound);

        this.states.searchFileParams.setField('page_size', this.states.config.value.searchPageSize);
        this.states.searchFileParams.setField('exchange_groupid', this.states.config.value.defaultGroupId);
        this.states.searchFileParams.setField('fromdate_moment', moment().add(-this.states.config.value.searchDays, 'days'));
        this.states.searchFileParams.setField('fromdate', this.fromDateDefault);
        this.states.searchFileParams.setField('todate_moment', moment());
        this.states.searchFileParams.setField('todate', this.toDateDefault);
        // this.states.searchFileParams.subscribe(this.searchFilesBound());
        this.states.selectedFilesAction.subscribe(this.selectedFilesActionChangedBound);

        this.states.user.set(loginResponse.user);
        this.states.loggedIn.set(true);

        this.states.selectedMenu.set('exchanges');

        Promise.all([
            this.searchExchanges()
        ]).then(responses => {
            this.states.curtainVisible.set(false);
        });
    }

    showLoginError(code: string) {
        this.states.loginError.set(code);
        this.states.loginErrorVisible.set(true);
    }

    hideLoginError() {
        this.states.loginErrorVisible.set(false);
    }

    forgotPassword(alertIfEmailEmpty: boolean = true) {
        if (this.usernameFormControl.valid) {
            this.bottomSheet.open(ResetPasswordComponent, {
                disableClose: true,
                data: {email: this.usernameFormControl.value, create: true}
            }).afterDismissed().subscribe(result => {
                if (result) {
                    this.server.resetPassword(this.usernameFormControl.value).then(resetPasswordResponse => {
                    }).catch(resetPasswordError => {
                        alert(resetPasswordError.message);
                    });
                }
            });
        } else if (alertIfEmailEmpty) {
            alert(this.states.texts.value.forms.email.required[this.states.lang.value]);
        }
    }

    updateCompanyRegion(companyRegions) {
        const companyRegionByID: Array<CompanyRegion> = [];
        companyRegions.forEach(companyRegion => {
            companyRegionByID[companyRegion.id] = companyRegion;
        });
        this.states.companyRegionByID.set(companyRegionByID);
        this.states.companyRegion.set(companyRegions);
    }

    updateExchangeGroups(exchangeGroups) {
        const exchangeGroupsByID: Array<ExchangeGroup> = [];
        exchangeGroups.forEach(exchangeGroup => {
            exchangeGroupsByID[exchangeGroup.ID] = exchangeGroup;
        });
        this.states.exchangeGroupsByID.set(exchangeGroupsByID);
        this.states.exchangeGroups.set(exchangeGroups);
    }

    updateExchangeTypes(exchangeTypes) {
        const exchangeTypesByID: Array<ExchangeType> = [];
        const exchangeTypesByGroupID: Array<Array<ExchangeType>> = [];
        exchangeTypes.forEach(exchangeType => {
            exchangeTypesByID[exchangeType.ID] = exchangeType;
            if (!exchangeTypesByGroupID[exchangeType.GROUPID]) {
                exchangeTypesByGroupID[exchangeType.GROUPID] = [];
            }
            exchangeTypesByGroupID[exchangeType.GROUPID].push(exchangeType);
        });
        this.states.exchangeTypesByID.set(exchangeTypesByID);
        this.states.exchangeTypesByGroupID.set(exchangeTypesByGroupID);
        this.states.exchangeTypes.set(exchangeTypes);
    }

    minDateExchangesParam(date: Moment): boolean {
        return this.states.searchExchangeParams.value.todate_moment ? (date.toDate().getTime() < this.states.searchExchangeParams.value.todate_moment.toDate().getTime()) : true;
    }

    maxDateExchangesParam(date: Moment): boolean {
        return this.states.searchExchangeParams.value.fromdate_moment ? (date.toDate().getTime() > this.states.searchExchangeParams.value.fromdate_moment.toDate().getTime()) : true;
    }

    minDateFilesParam(date: Moment): boolean {
        return this.states.searchFileParams.value.todate_moment ? (date.toDate().getTime() < this.states.searchFileParams.value.todate_moment.toDate().getTime()) : true;
    }

    maxDateFilesParam(date: Moment): boolean {
        return this.states.searchFileParams.value.fromdate_moment ? (date.toDate().getTime() > this.states.searchFileParams.value.fromdate_moment.toDate().getTime()) : true;
    }

    searchExchanges(): Promise<any> {
        return new Promise(resolve => {
            this.states.searchingExchanges.set(true);
            this.states.selectedExchangesIDs.set([]);
            /*
            alert('3!'+JSON.stringify(this.states.searchExchangeParams.value));
            try {
                alert(this.states.searchExchangeParams.value.fromdate_moment);
                this.states.searchExchangeParams.value.fromdate = this.utils.convertToJAVADate(this.states.searchExchangeParams.value.fromdate_moment);
            }
            catch (e) {
                alert(e.message);
            }
            */
            this.states.searchExchangeParams.value.fromdate = this.states.searchExchangeParams.value.fromdate_moment ? this.utils.convertToJAVADate(this.states.searchExchangeParams.value.fromdate_moment) : null;
            this.states.searchExchangeParams.value.todate = this.states.searchExchangeParams.value.todate_moment ? this.utils.convertToJAVADate(this.states.searchExchangeParams.value.todate_moment) : null;
            // alert('4!'+JSON.stringify(this.states.searchExchangeParams.value));
            const searchParams = JSON.stringify(this.states.searchExchangeParams.value);
            this.server.getExchanges(this.states.searchExchangeParams.value).then(response => {
                if (searchParams === JSON.stringify(this.states.searchExchangeParams.value)) {
                    this.states.searchExchangeResult.set(response);
                    this.states.searchingExchanges.set(false);
                } else {
                    console.log('searchExchange outdated response', searchParams, JSON.stringify(this.states.searchExchangeParams.value));
                }
                resolve();
            }).catch(error => {
                this.states.searchingExchanges.set(false);
                console.error('searchExchange error', error);
                resolve();
            });
        });
    }

    searchFiles(): Promise<any> {
        return new Promise(resolve => {
            this.states.searchingFiles.set(true);
            this.states.selectedFilesIDs.set([]);
            this.states.searchFileParams.value.fromdate = this.states.searchFileParams.value.fromdate_moment ? this.utils.convertToJAVADate(this.states.searchFileParams.value.fromdate_moment) : null;
            this.states.searchFileParams.value.todate = this.states.searchFileParams.value.todate_moment ? this.utils.convertToJAVADate(this.states.searchFileParams.value.todate_moment) : null;
            // alert(JSON.stringify(this.states.searchFileParams.value));
            const searchParams = JSON.stringify(this.states.searchFileParams.value);
            this.server.getFiles(this.states.searchFileParams.value).then(response => {
                if (searchParams === JSON.stringify(this.states.searchFileParams.value)) {
                    this.states.searchFileResult.set(response);
                    this.states.searchingFiles.set(false);
                } else {
                    console.log('searchFile outdated response', searchParams, JSON.stringify(this.states.searchFileParams.value));
                }
                resolve();
            }).catch(error => {
                this.states.searchingFiles.set(false);
                console.error('searchFile error', error);
                resolve();
            });
        });
    }

    selectedExchangesActionChanged() {
        switch (this.states.selectedExchangesAction.value) {
            case 'delete':
                this.states.selectedExchangesIDs.set([]);
                alert(this.states.selectedExchangesIDs.value);
                break;
        }
    }

    selectedFilesActionChanged() {
        switch (this.states.selectedFilesAction.value) {
            case 'delete':
                alert(this.states.selectedFilesIDs.value);
                break;
            case 'download':
                this.states.curtainVisible.set(true);
                this.server.downloadFile(this.states.selectedFilesIDs.value[0]).then(() => {
                }).catch(error => {
                    alert(error.message);
                }).finally(() => {
                    this.states.curtainVisible.set(false);
                });
        }
    }
}
