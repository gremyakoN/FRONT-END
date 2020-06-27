import {ApplicationRef, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {StateComponent} from '../classes/StateComponent';
import {States} from '../providers/states';
import {Server} from '../providers/server';
import {FormControl, Validators} from '@angular/forms';
import {MatBottomSheet, MatDialog, MatTreeNestedDataSource} from '@angular/material';
import {ResetPasswordComponent} from '../components/reset-password.component';
import {
    CompanyRegion,
    ExchangeType, ExchangeGroup,
    SearchExchangeParams
} from '../classes/Interfaces';
import {NestedTreeControl} from '@angular/cdk/tree';
// import {CommitteeDetailsComponent} from '../components/committee-details.component';
// import {PrimaryOrganizationDetailsComponent} from '../components/primary-organization-details.component';
// import {AssignmentEditComponent} from '../components/assignment-edit.component';
// import {CategoryEditComponent} from '../components/category-edit.component';
// import {PromotionEditComponent} from '../components/promotion-edit.component';
// import {PromotionSelectComponent} from '../components/promotion-select.component';
// import {CategorySelectComponent} from '../components/category-select.component';
import {Utils} from '../providers/utils';
// import {AddArticleComponent} from '../components/add-article.component';
// import dayGridPlugin from '@fullcalendar/daygrid';
import listMonthPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
// import {FullCalendarComponent} from '@fullcalendar/angular';
// import {AddEventComponent} from '../components/add-event.component';
// import {EventSelectComponent} from '../components/event-select.component';
import * as moment from 'moment';
import {Moment} from 'moment';
// import {error} from '@angular/compiler/src/util';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})

export class AppComponent extends StateComponent implements OnInit {

    // menuItems: Array<string> = [/*'exchanges', */'members', 'payments', null, 'events', 'news', null, 'hierarchy', 'assignments', 'categories', 'promotions'];
    menuItems: Array<string> = ['exchanges'];

    runTickBound: FrameRequestCallback;
    usernameFormControl: FormControl;
    passwordFormControl: FormControl;
    // hierarchyTreeControl: NestedTreeControl<Committee>;
    // hierarchyDataSource: MatTreeNestedDataSource<Committee>;
    // committeeHasChildrenBound: Function;
    // searchMembersBound: Function;
    // searchPaymentsBound: Function;

    fromDateDefault: string;
    toDateDefault: string;

    minDateParamBound: Function;
    maxDateParamBound: Function;
    searchExchangesBound: Function;
    selectedExchangesActionChangedBound: Function;

    //@ViewChild(FullCalendarComponent) eventsCalendar: FullCalendarComponent;

    constructor(private app: ApplicationRef, public states: States, private utils: Utils, private server: Server, private bottomSheet: MatBottomSheet, private dialog: MatDialog, changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
        this.runTickBound = this.runTick.bind(this);
        //this.committeeHasChildrenBound = this.committeeHasChildren.bind(this);

        this.minDateParamBound = this.minDateParam.bind(this);
        this.maxDateParamBound = this.maxDateParam.bind(this);
        this.searchExchangesBound = this.searchExchanges.bind(this);
        this.selectedExchangesActionChangedBound = this.selectedExchangesActionChanged.bind(this);

        //this.searchPaymentsBound = this.searchPayments.bind(this);
        //this.addEventWithDateBound = this.addEventWithDate.bind(this);
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
            this.states.exchanges,
            //this.states.committees,
            //this.states.assignmentsByLevel,
            //this.states.categories,
            this.states.selectedExchangesIDs
            //this.states.news,
            //this.states.eventsCalendarTitle,
            //this.states.events
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

        this.usernameFormControl = new FormControl('gremyako', [
            Validators.required,
        ]);
        this.passwordFormControl = new FormControl('pocv1bvq', [
            Validators.required
        ]);

        //this.hierarchyTreeControl = new NestedTreeControl<Committee>(node => {
        //    return node.children;
        //});
        //this.hierarchyDataSource = new MatTreeNestedDataSource<Committee>();

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
        //this.menuItems.push('qwe');
        //this.updateHierarchy(loginResponse.committees || [], loginResponse.primary_organizations || []);
        //this.updateAssignments(loginResponse.assignments || []);
        //this.updateCategories(loginResponse.categories || []);
        //this.updatePromotions(loginResponse.promotions || []);
        //this.updateStatuses(loginResponse.statuses || []);
        //this.updateCardTypes(loginResponse.card_types || []);

        //this.states.searchPaymentsParams.setField('page_size', this.states.config.value.searchPageSize);
        //this.states.searchPaymentsParams.subscribe(this.searchPaymentsBound);
        this.states.selectedExchangesAction.subscribe(this.selectedExchangesActionChangedBound);
        //this.states.news.set(loginResponse.news || []);
        //this.updateEvents(loginResponse.events || []);

        this.states.searchExchangeParams.setField('page_size', this.states.config.value.searchPageSize);
        this.states.searchExchangeParams.setField('exchange_groupid', this.states.config.value.defaultGroupId);
        this.fromDateDefault = this.utils.convertToJAVADate(moment().add(-this.states.config.value.searchDays, 'days'));
        this.toDateDefault = this.utils.convertToJAVADate(moment());
        this.states.searchExchangeParams.setField('fromdate_moment', moment().add(-this.states.config.value.searchDays, 'days'));
        this.states.searchExchangeParams.setField('fromdate', this.fromDateDefault);
        this.states.searchExchangeParams.setField('todate_moment', moment());
        this.states.searchExchangeParams.setField('todate', this.toDateDefault);

        this.states.searchExchangeParams.subscribe(this.searchExchangesBound());

        this.states.user.set(loginResponse.user);
        window.requestAnimationFrame(() => {
            //this.updateCalendarSize();
            //this.updateCalendarTitle();
            //this.eventsCalendar.getApi().on('datesRender', () => {
            //    this.updateCalendarTitle();
            //});
            this.states.loggedIn.set(true);
        });
        Promise.all([
            //this.loadUserPhoto(),
            //this.searchMembers(),
            //this.searchPayments()
            this.searchExchanges()
        ]).then(responses => {
            //this.states.user.setField('photo', responses[0]);
            this.states.curtainVisible.set(false);
        });
    }
/*
    updateCalendarTitle() {
        this.states.eventsCalendarTitle.set(this.eventsCalendar.getApi().view.title);
    }

    updateCalendarSize(prevHeight: number = 0) {
        const currentHeight = this.eventsCalendar.getApi().component.el.parentElement.clientHeight;
        if (currentHeight !== prevHeight) {
            this.eventsCalendar.getApi().updateSize();
        }
        window.requestAnimationFrame(() => {
            this.updateCalendarSize(currentHeight);
        });
    }

    loadUserPhoto(): Promise<any> {
        return new Promise(resolve => {
            // resolve(null);
            if (this.states.user.value.photo_id) {
                this.server.loadImage(this.states.user.value.photo_id).then(response => {
                    resolve(response.image);
                });
            } else {
                resolve(null);
            }
        });
    }
*/
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

    updateCompanyRegion(companyRegion) {
        const companyRegionByID: Array<CompanyRegion> = [];
        companyRegion.forEach(companyRegion => {
            companyRegionByID[companyRegion.id] = companyRegion;
            //this.menuItems.push(companyregion.id.toString());
        });
        this.states.companyRegionByID.set(companyRegionByID);
        this.states.companyRegion.set(companyRegion);
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

    minDateParam(date: Moment): boolean {
        return this.states.searchExchangeParams.value.todate_moment ? (date.toDate().getTime() < this.states.searchExchangeParams.value.todate_moment.toDate().getTime()) : true;
    }

    maxDateParam(date: Moment): boolean {
        return this.states.searchExchangeParams.value.fromdate_moment ? (date.toDate().getTime() > this.states.searchExchangeParams.value.fromdate_moment.toDate().getTime()) : true;
    }

    /*
        updateHierarchy(committees: Array<Committee> = null, primaryOrganizations: Array<PrimaryOrganization> = null) {
            if (primaryOrganizations) {
                const primaryOrganizationsByID: Array<PrimaryOrganization> = [];
                const primaryOrganizationsByCommittee: Array<PrimaryOrganization> = [];
                primaryOrganizations.forEach(po => {
                    if (!primaryOrganizationsByCommittee[po.committee_id]) {
                        primaryOrganizationsByCommittee[po.committee_id] = [];
                    }
                    primaryOrganizationsByCommittee[po.committee_id].push(po);
                    primaryOrganizationsByID[po.id] = po;
                });
                this.states.primaryOrganizations.set(primaryOrganizations);
                this.states.primaryOrganizationsByID.set(primaryOrganizationsByID);
                this.states.primaryOrganizationsByCommittee.set(primaryOrganizationsByCommittee);
            }
            if (committees) {
                const flattenCommittees: Array<Committee> = this.flattenTree(committees);
                const committeesByID: Array<Committee> = [];
                flattenCommittees.forEach(committee => {
                    committeesByID[committee.id] = committee;
                });
                this.states.committees.set(flattenCommittees);
                this.states.committeesByID.set(committeesByID);
                this.hierarchyDataSource.data = committees;
                this.hierarchyTreeControl.expand(this.hierarchyDataSource.data[0]);
            }
        }

        flattenTree(obj, arr = []): Array<Committee> {
            if (Array.isArray(obj)) {
                obj.forEach(element => {
                    this.flattenTree(element, arr);
                });
            } else {
                arr[obj.id] = obj;
                if (obj.children && obj.children.length) {
                    this.flattenTree(obj.children, arr);
                }
            }
            return arr;
        }

        committeeHasChildren(index: number, node: Committee): boolean {
            return (node.children && !!node.children.length) || (this.states.primaryOrganizationsByCommittee.value[node.id.toString()]);
        }

        showCommitteeDetails(committee = null) {
            this.dialog.open(CommitteeDetailsComponent, {
                disableClose: true,
                panelClass: 'big-popup',
                data: committee ? JSON.parse(JSON.stringify(committee)) : null
            }).afterClosed().subscribe(committees => {
                if (committees) {
                    this.updateHierarchy(committees);
                }
            });
        }

        showPrimaryOrganizationDetails(primaryOrganization = null) {
            this.dialog.open(PrimaryOrganizationDetailsComponent, {
                disableClose: true,
                panelClass: 'big-popup',
                data: primaryOrganization ? JSON.parse(JSON.stringify(primaryOrganization)) : null
            }).afterClosed().subscribe(primaryOrganizations => {
                if (primaryOrganizations) {
                    this.updateHierarchy(null, primaryOrganizations);
                }
            });
        }

        showAssignmentEdit(assignment = null) {
            this.dialog.open(AssignmentEditComponent, {
                disableClose: true,
                panelClass: 'big-popup',
                data: assignment ? JSON.parse(JSON.stringify(assignment)) : null
            }).afterClosed().subscribe(assignments => {
                if (assignments !== undefined) {
                    this.updateAssignments(assignments || []);
                }
            });
        }

        showCategoryEdit(category = null) {
            this.dialog.open(CategoryEditComponent, {
                disableClose: true,
                panelClass: 'big-popup',
                data: category ? JSON.parse(JSON.stringify(category)) : null
            }).afterClosed().subscribe(categories => {
                if (categories !== undefined) {
                    this.updateCategories(categories || []);
                }
            });
        }

        showPromotionEdit(promotion = null) {
            this.dialog.open(PromotionEditComponent, {
                disableClose: true,
                panelClass: 'big-popup',
                data: promotion ? JSON.parse(JSON.stringify(promotion)) : null
            }).afterClosed().subscribe(promotions => {
                if (promotions !== undefined) {
                    this.updatePromotions(promotions || []);
                }
            });
        }
    */

    searchExchanges(): Promise<any> {
        return new Promise(resolve => {
            this.states.searching.set(true);
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
                    this.states.searching.set(false);
                } else {
                    console.log('searchExchange outdated response', searchParams, JSON.stringify(this.states.searchExchangeParams.value));
                }
                resolve();
            }).catch(error => {
                this.states.searching.set(false);
                console.error('searchExchange error', error);
                resolve();
            });
        });
    }
/*
    searchMembers(): Promise<any> {
        return new Promise(resolve => {
            this.states.searching.set(true);
            this.states.selectedMembersIDs.set([]);
            const searchParams = JSON.stringify(this.states.searchParams.value);
            this.server.getMembers(this.states.searchParams.value).then(response => {
                if (searchParams === JSON.stringify(this.states.searchParams.value)) {
                    this.states.searchResult.set(response);
                    this.states.searching.set(false);
                } else {
                    console.log('searchMembers outdated response', searchParams, JSON.stringify(this.states.searchParams.value));
                }
                resolve();
            }).catch(error => {
                this.states.searching.set(false);
                console.error('searchMembers error', error);
                resolve();
            });
        });
    }

    updateSearchPaymentsInputWithEnter(event) {
        if (event.key === 'Enter') {
            this.updateSearchPaymentsInput(event.target.value);
        }
    }

    updateSearchPaymentsInput(value: string) {
        this.states.searchPaymentsParams.setField('search_like', value);
        this.searchPayments();
    }

    searchPayments(): Promise<any> {
        return new Promise(resolve => {
            this.states.searchingPayments.set(true);
            const searchParams = JSON.stringify(this.states.searchPaymentsParams.value);
            this.server.getPayments(this.states.searchPaymentsParams.value).then(response => {
                if (searchParams === JSON.stringify(this.states.searchPaymentsParams.value)) {
                    this.states.searchPaymentsResult.set(response);
                    this.states.searchingPayments.set(false);
                } else {
                    console.log('searchPayments outdated response', searchParams, JSON.stringify(this.states.searchPaymentsParams.value));
                }
                resolve();
            }).catch(error => {
                this.states.searchingPayments.set(false);
                console.error('searchPayments error', error);
                resolve();
            });
        });
    }
*/
    selectedExchangesActionChanged() {
        switch (this.states.selectedExchangesAction.value) {
            case 'delete':
                alert(this.states.selectedExchangesIDs.value);
                /*this.dialog.open(CategorySelectComponent, {
                    disableClose: true,
                    panelClass: 'small-popup'
                }).afterClosed().subscribe(category => {
                    if (category) {
                        this.states.curtainVisible.set(true);
                        this.server.changeCategory(this.states.selectedMembersIDs.value, category.id).then(() => {
                        }).catch(error => {
                            alert(error.message);
                        }).finally(() => {
                            this.searchMembers().then(() => {
                                this.states.curtainVisible.set(false);
                            });
                        });
                    }
                });
                */
                break;
        }
    }
/*
    selectedMembersActionChanged() {
        switch (this.states.selectedMembersAction.value) {
            case 'changeCategory':
                this.dialog.open(CategorySelectComponent, {
                    disableClose: true,
                    panelClass: 'small-popup'
                }).afterClosed().subscribe(category => {
                    if (category) {
                        this.states.curtainVisible.set(true);
                        this.server.changeCategory(this.states.selectedMembersIDs.value, category.id).then(() => {
                        }).catch(error => {
                            alert(error.message);
                        }).finally(() => {
                            this.searchMembers().then(() => {
                                this.states.curtainVisible.set(false);
                            });
                        });
                    }
                });
                break;
            case 'payedWithCash':
                this.states.curtainVisible.set(true);
                this.server.payedWithCash(this.states.selectedMembersIDs.value).then(() => {
                }).catch(error => {
                    alert(error.message);
                }).finally(() => {
                    this.searchMembers().then(() => {
                        this.states.curtainVisible.set(false);
                    });
                });
                break;
            case 'applyPromotion':
                this.dialog.open(PromotionSelectComponent, {
                    disableClose: true,
                    panelClass: 'small-popup'
                }).afterClosed().subscribe(promotion => {
                    if (promotion) {
                        this.states.curtainVisible.set(true);
                        this.server.applyPromotion(this.states.selectedMembersIDs.value, promotion.id, promotion.value).then(() => {
                        }).catch(error => {
                            alert(error.message);
                        }).finally(() => {
                            this.searchMembers().then(() => {
                                this.states.curtainVisible.set(false);
                            });
                        });
                    }
                });
                break;
            case 'checkIn':
                this.dialog.open(EventSelectComponent, {
                    disableClose: true,
                    panelClass: 'small-popup'
                }).afterClosed().subscribe(eventID => {
                    if (eventID) {
                        this.states.curtainVisible.set(true);
                        this.server.checkIn(this.states.selectedMembersIDs.value, eventID).then(() => {
                        }).catch(error => {
                            alert(error.message);
                        }).finally(() => {
                            this.states.selectedMembersIDs.set([]);
                            this.states.curtainVisible.set(false);
                        });
                    }
                });
                break;
        }
    }

    addArticle(article = null) {
        this.dialog.open(AddArticleComponent, {
            disableClose: true,
            panelClass: 'small-popup',
            data: article ? JSON.parse(JSON.stringify(article)) : null
        }).afterClosed().subscribe(editedArticle => {
            if (editedArticle) {
                this.states.curtainVisible.set(true);
                const serverCommand: Function = article ? this.server.updateArticle : this.server.addArticle;
                serverCommand.bind(this.server)(editedArticle).then(response => {
                    this.states.news.set(response.news);
                }).catch(error => {
                    alert(error.message);
                }).finally(() => {
                    this.states.curtainVisible.set(false);
                });
            }
        });
    }

    deleteArticle(articleID: string) {
        this.server.deleteArticle(articleID).then(response => {
            this.states.news.set(response.news);
        });
    }

    updateEvents(events: Array<CalendarEvent>) {
        const fullCalendarEvents = [];
        const eventsByID = [];
        events.forEach(event => {
            fullCalendarEvents.push({
                id: event.id,
                title: event.name,
                start: event.date_from,
                end: event.date_to,
                color: event.color ? '#' + event.color : null,
                textColor: event.color ? this.utils.getContrastTextColor('#' + event.color) : null
            });
            eventsByID[event.id] = event;
        });
        this.states.events.set(fullCalendarEvents);
        this.states.eventsByID.set(eventsByID);
    }

    addEvent(eventID: string, date: string = null) {
        this.dialog.open(AddEventComponent, {
            disableClose: true,
            panelClass: 'big-popup',
            data: eventID ? JSON.parse(JSON.stringify(this.states.eventsByID.value[eventID])) : ({date_from: date} || null)
        }).afterClosed().subscribe(events => {
            if (events) {
                this.updateEvents(events);
            }
        });
    }

    addEventWithDate(date: Moment) {
        this.addEvent(null, this.utils.convertToJAVADate(moment(date)));
    }
*/

}
