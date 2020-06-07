import {Injectable} from '@angular/core';
import {State} from '../classes/State';
import {
    TExchange,
    TFile,
    Assignment,
    CalendarEvent,
    CardType,
    Category,
    Committee,
    FullCalendarEvent,
    PrimaryOrganization,
    Promotion,
    SearchParams, SearchPaymentsParams, SearchPaymentsResult,
    SearchResult,
    Status,
    User
} from '../classes/Interfaces';

@Injectable()
export class States {
    lang: State<string> = new State<string>('');
    texts: State<any> = new State<any>(null);
    config: State<any> = new State<any>(null);
    initComplete: State<boolean> = new State<boolean>(false);
    curtainVisible: State<boolean> = new State<boolean>(false);
    loginError: State<string> = new State<string>('');
    loginErrorVisible: State<boolean> = new State<boolean>(false);
    selectedMenu: State<string> = new State<string>('');
    user: State<User> = new State<User>(null);

    exchanges: State<Array<TExchange>> = new State<Array<TExchange>>(null);
    files: State<Array<TFile>> = new State<Array<TFile>>(null);


    loggedIn: State<boolean> = new State<boolean>(false);
    events: State<Array<FullCalendarEvent>> = new State<Array<FullCalendarEvent>>(null);
    eventsByID: State<Array<CalendarEvent>> = new State<Array<CalendarEvent>>([]);
    assignments: State<Array<Assignment>> = new State<Array<Assignment>>(null);
    assignmentsLevels: State<Array<string>> = new State<Array<string>>(null);
    assignmentsByLevel: State<Array<Array<Assignment>>> = new State<Array<Array<Assignment>>>(null);
    assignmentsByID: State<Array<Assignment>> = new State<Array<Assignment>>(null);
    committees: State<Array<Committee>> = new State<Array<Committee>>(null);
    committeesByID: State<Array<Committee>> = new State<Array<Committee>>(null);
    primaryOrganizations: State<Array<PrimaryOrganization>> = new State<Array<PrimaryOrganization>>(null);
    primaryOrganizationsByID: State<Array<PrimaryOrganization>> = new State<Array<PrimaryOrganization>>(null);
    primaryOrganizationsByCommittee: State<Array<PrimaryOrganization>> = new State<Array<PrimaryOrganization>>(null);
    categories: State<Array<Category>> = new State<Array<Category>>(null);
    categoriesByID: State<Array<Category>> = new State<Array<Category>>(null);
    promotions: State<Array<Promotion>> = new State<Array<Promotion>>(null);
    promotionsByID: State<Array<Promotion>> = new State<Array<Promotion>>(null);
    searchFiltersExpanded: State<boolean> = new State<boolean>(false);
    searchParams: State<SearchParams> = new State<SearchParams>(null);
    searchPaymentsFiltersExpanded: State<boolean> = new State<boolean>(false);
    searchPaymentsParams: State<SearchPaymentsParams> = new State<SearchPaymentsParams>(null);
    statuses: State<Array<Status>> = new State<Array<Status>>(null);
    statusesByID: State<Array<Status>> = new State<Array<Status>>(null);
    cardTypes: State<Array<Status>> = new State<Array<CardType>>(null);
    cardTypesByID: State<Array<Status>> = new State<Array<CardType>>(null);
    searchResult: State<SearchResult> = new State<SearchResult>(null);
    searching: State<boolean> = new State<boolean>(false);
    searchPaymentsResult: State<SearchPaymentsResult> = new State<SearchPaymentsResult>(null);
    searchingPayments: State<boolean> = new State<boolean>(false);
    selectedMembersIDs: State<Array<string>> = new State<Array<string>>([]);
    selectedMembersAction: State<string> = new State<string>(null);
    news: State<Array<any>> = new State<Array<any>>(null);
    eventsCalendarTitle: State<string> = new State<string>(null);
    activeLinkPreview: State<number> = new State<number>(null);
}
