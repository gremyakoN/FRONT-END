import {ApplicationRef, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {StateComponent} from '../classes/StateComponent';
import {States} from '../providers/states';
import {Server} from '../providers/server';
import {FormControl, Validators} from '@angular/forms';
import {MatBottomSheet, MatDialog, MatTreeNestedDataSource} from '@angular/material';
import {ResetPasswordComponent} from '../components/reset-password.component';
import {
    Article,
    Assignment,
    CalendarEvent,
    Category,
    Committee,
    PrimaryOrganization,
    Promotion,
    SearchParams,
    SearchPaymentsParams
} from '../classes/Interfaces';
import {NestedTreeControl} from '@angular/cdk/tree';
import {CommitteeDetailsComponent} from '../components/committee-details.component';
import {PrimaryOrganizationDetailsComponent} from '../components/primary-organization-details.component';
import {AssignmentEditComponent} from '../components/assignment-edit.component';
import {CategoryEditComponent} from '../components/category-edit.component';
import {PromotionEditComponent} from '../components/promotion-edit.component';
import {PromotionSelectComponent} from '../components/promotion-select.component';
import {CategorySelectComponent} from '../components/category-select.component';
import {Utils} from '../providers/utils';
import {AddArticleComponent} from '../components/add-article.component';
import dayGridPlugin from '@fullcalendar/daygrid';
import listMonthPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import {FullCalendarComponent} from '@fullcalendar/angular';
import {AddEventComponent} from '../components/add-event.component';
import {EventSelectComponent} from '../components/event-select.component';
import * as moment from 'moment';
import {Moment} from 'moment';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})

export class AppComponent extends StateComponent implements OnInit {

    menuItems: Array<string> = ['members', 'payments', null, 'events', 'news', null, 'hierarchy', 'assignments', 'categories', 'promotions'];

    runTickBound: FrameRequestCallback;
    usernameFormControl: FormControl;
    passwordFormControl: FormControl;
    hierarchyTreeControl: NestedTreeControl<Committee>;
    hierarchyDataSource: MatTreeNestedDataSource<Committee>;
    committeeHasChildrenBound: Function;
    searchMembersBound: Function;
    searchPaymentsBound: Function;
    selectedMembersActionChangedBound: Function;
    calendarPlugins = [dayGridPlugin, listMonthPlugin, timeGridPlugin];
    addEventWithDateBound: Function;

    @ViewChild(FullCalendarComponent) eventsCalendar: FullCalendarComponent;

    constructor(private app: ApplicationRef, public states: States, private utils: Utils, private server: Server, private bottomSheet: MatBottomSheet, private dialog: MatDialog, changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
        this.runTickBound = this.runTick.bind(this);
        this.committeeHasChildrenBound = this.committeeHasChildren.bind(this);
        this.searchMembersBound = this.searchMembers.bind(this);
        this.searchPaymentsBound = this.searchPayments.bind(this);
        this.selectedMembersActionChangedBound = this.selectedMembersActionChanged.bind(this);
        this.addEventWithDateBound = this.addEventWithDate.bind(this);
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
            this.states.committees,
            this.states.assignmentsByLevel,
            this.states.categories,
            this.states.selectedMembersIDs,
            this.states.news,
            this.states.eventsCalendarTitle,
            this.states.events
        ]);
        Promise.all([
            this.server.loadTexts(),
            this.server.loadConfig()
        ]).then(data => {
            this.states.texts.set(data[0]);
            this.states.config.set(data[1]);
            this.states.lang.set(data[1].defaultLang);
            this.states.initComplete.set(true);
            const savedSessionID: string = window.localStorage.getItem('session_id');
            // const savedSessionID = null;
            if (savedSessionID) {
                this.states.curtainVisible.set(true);
                this.server.session_id = savedSessionID;
                window.localStorage.removeItem('session_id');
                this.server.refresh().then(response => {
                    this.afterLogin(response);
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
        // this.emailFormControl = new FormControl('e.tihomirov@besmart.by', [
        //     Validators.required,
        //     Validators.email,
        // ]);
        // this.passwordFormControl = new FormControl('password', [
        //     Validators.required
        // ]);
        // this.emailFormControl = new FormControl('v.korneev@besmart.by', [
        //     Validators.required,
        //     Validators.email,
        // ]);
        // this.passwordFormControl = new FormControl('v@lent1n', [
        //     Validators.required
        // ]);
        this.hierarchyTreeControl = new NestedTreeControl<Committee>(node => {
            return node.children;
        });
        this.hierarchyDataSource = new MatTreeNestedDataSource<Committee>();
        this.states.assignmentsLevels.set(['4', '3', '2', '1', '0']);
        this.states.searchParams.set({
            page_number: 1,
            page_size: 0,
            primary_organization_id: null,
            assignment_id: null,
            status: null,
            card_type: null,
            min_age: null,
            max_age: null,
            min_inserted: null,
            max_inserted: null,
            min_inserted_date: null,
            max_inserted_date: null,
            with_photo: null,
            with_passport: null,
            is_debtor: null,
            min_mark: null,
            max_mark: null,
            category_id: null
        } as SearchParams);
        this.states.searchPaymentsParams.set({
            page_number: 1,
            page_size: 0,
            committee_id: null,
            period: null,
            is_erip: null
        } as SearchPaymentsParams);
        document.body.appendChild(document.body.querySelector('div[curtain]'));
        this.states.selectedMenu.set('members');
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
        window.localStorage.setItem('session_id', loginResponse.user.session_id);
        this.server.session_id = loginResponse.user.session_id;
        this.updateHierarchy(loginResponse.committees || [], loginResponse.primary_organizations || []);
        this.updateAssignments(loginResponse.assignments || []);
        this.updateCategories(loginResponse.categories || []);
        this.updatePromotions(loginResponse.promotions || []);
        this.updateStatuses(loginResponse.statuses || []);
        this.updateCardTypes(loginResponse.card_types || []);
        // loginResponse.user.is_admin = false;
        // loginResponse.user.hierarchy_level = 1;
        // loginResponse.user.work_committee_id = 3;
        this.states.searchParams.setField('page_size', this.states.config.value.searchPageSize);
        this.states.searchParams.subscribe(this.searchMembersBound);
        this.states.searchPaymentsParams.setField('page_size', this.states.config.value.searchPageSize);
        this.states.searchPaymentsParams.subscribe(this.searchPaymentsBound);
        this.states.selectedMembersAction.subscribe(this.selectedMembersActionChangedBound);
        this.states.news.set(loginResponse.news || []);
        this.updateEvents(loginResponse.events || []);
        this.states.user.set(loginResponse.user);
        window.requestAnimationFrame(() => {
            this.updateCalendarSize();
            this.updateCalendarTitle();
            this.eventsCalendar.getApi().on('datesRender', () => {
                this.updateCalendarTitle();
            });
            this.states.loggedIn.set(true);
        });
        Promise.all([
            this.loadUserPhoto(),
            this.searchMembers(),
            this.searchPayments()
        ]).then(responses => {
            this.states.user.setField('photo', responses[0]);
            this.states.curtainVisible.set(false);
        });
    }

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
        return (node.children && !!node.children.length) || (this.states.primaryOrganizationsByCommittee.value[node.id]);
    }

    updateAssignments(assignments) {
        const assignmentsByID: Array<Assignment> = [];
        const assignmentByLevel: Array<Array<Assignment>> = [];
        assignments.forEach(assignment => {
            assignmentsByID[assignment.id] = assignment;
            if (!assignmentByLevel[assignment.hierarchy_level]) {
                assignmentByLevel[assignment.hierarchy_level] = [];
            }
            assignmentByLevel[assignment.hierarchy_level].push(assignment);
        });
        this.states.assignments.set(assignments);
        this.states.assignmentsByLevel.set(assignmentByLevel);
        this.states.assignmentsByID.set(assignmentsByID);
    }

    updateCategories(categories) {
        const categoriesByID: Array<Category> = [];
        categories.forEach(category => {
            categoriesByID[category.id] = category;
        });
        this.states.categoriesByID.set(categoriesByID);
        this.states.categories.set(categories);
    }

    updatePromotions(promotions) {
        const promotionsByID: Array<Promotion> = [];
        promotions.forEach(promotion => {
            promotionsByID[promotion.id] = promotion;
        });
        this.states.promotionsByID.set(promotionsByID);
        this.states.promotions.set(promotions);
    }

    updateStatuses(statuses) {
        const statusesByID: Array<Promotion> = [];
        statuses.forEach(status => {
            statusesByID[status.id] = status;
        });
        this.states.statusesByID.set(statusesByID);
        this.states.statuses.set(statuses);
    }

    updateCardTypes(cardTypes) {
        const cardTypesByID: Array<Promotion> = [];
        cardTypes.forEach(status => {
            cardTypesByID[status.id] = status;
        });
        this.states.cardTypesByID.set(cardTypesByID);
        this.states.cardTypes.set(cardTypes);
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

    updateSearchInputWithEnter(event) {
        if (event.key === 'Enter') {
            this.updateSearchInput(event.target.value);
        }
    }

    updateSearchInput(value: string) {
        this.states.searchParams.setField('search_like', value);
        this.searchMembers();
    }

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
}
