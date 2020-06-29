import {Injectable} from '@angular/core';
import {State} from '../classes/State';
import {
    Exchange, SearchExchangeParams, SearchExchangeResult,
    ExchangeGroup, ExchangeType,
    //ExchangeFilesResult,
    File,
    CompanyRegion,
    //Assignment,
    //CalendarEvent,
    //CardType,
    //Category,
    //Committee,
    //FullCalendarEvent,
    //PrimaryOrganization,
    //Promotion,
    //SearchParams, SearchPaymentsParams, SearchPaymentsResult,
    //Status,
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

    exchanges: State<Array<Exchange>> = new State<Array<Exchange>>(null);
    files: State<Array<File>> = new State<Array<File>>(null);
    searchExchangeParams: State<SearchExchangeParams> = new State<SearchExchangeParams>(null);
    searchExchangeResult: State<SearchExchangeResult> = new State<SearchExchangeResult>(null);
    // exchangeFilesResult: State<ExchangeFilesResult> = new State<ExchangeFilesResult>(null);
    searchExchangeFiltersExpanded: State<boolean> = new State<boolean>(false);
    loggedIn: State<boolean> = new State<boolean>(false);

    companyRegion: State<Array<CompanyRegion>> = new State<Array<CompanyRegion>>(null);
    companyRegionByID: State<Array<CompanyRegion>> = new State<Array<CompanyRegion>>(null);
    exchangeGroups: State<Array<ExchangeGroup>> = new State<Array<ExchangeGroup>>(null);
    exchangeGroupsByID: State<Array<ExchangeGroup>> = new State<Array<ExchangeGroup>>(null);
    exchangeTypes: State<Array<ExchangeType>> = new State<Array<ExchangeType>>(null);
    exchangeTypesByID: State<Array<ExchangeType>> = new State<Array<ExchangeType>>(null);
    exchangeTypesByGroupID: State<Array<Array<ExchangeType>>> = new State<Array<Array<ExchangeType>>>(null);
    selectedExchangesIDs: State<Array<string>> = new State<Array<string>>([]);
    selectedExchangesAction: State<string> = new State<string>(null);
    searching: State<boolean> = new State<boolean>(false);

    //events: State<Array<FullCalendarEvent>> = new State<Array<FullCalendarEvent>>(null);
    //eventsByID: State<Array<CalendarEvent>> = new State<Array<CalendarEvent>>([]);
    //assignments: State<Array<Assignment>> = new State<Array<Assignment>>(null);
    //assignmentsLevels: State<Array<string>> = new State<Array<string>>(null);
    //assignmentsByLevel: State<Array<Array<Assignment>>> = new State<Array<Array<Assignment>>>(null);
    //assignmentsByID: State<Array<Assignment>> = new State<Array<Assignment>>(null);
    //committees: State<Array<Committee>> = new State<Array<Committee>>(null);
    //committeesByID: State<Array<Committee>> = new State<Array<Committee>>(null);
    //primaryOrganizations: State<Array<PrimaryOrganization>> = new State<Array<PrimaryOrganization>>(null);
    //primaryOrganizationsByID: State<Array<PrimaryOrganization>> = new State<Array<PrimaryOrganization>>(null);
    //primaryOrganizationsByCommittee: State<Array<PrimaryOrganization>> = new State<Array<PrimaryOrganization>>(null);
    //categories: State<Array<Category>> = new State<Array<Category>>(null);
    //categoriesByID: State<Array<Category>> = new State<Array<Category>>(null);
    //promotions: State<Array<Promotion>> = new State<Array<Promotion>>(null);
    //promotionsByID: State<Array<Promotion>> = new State<Array<Promotion>>(null);
    //searchParams: State<SearchParams> = new State<SearchParams>(null);
    //searchPaymentsFiltersExpanded: State<boolean> = new State<boolean>(false);
    //searchPaymentsParams: State<SearchPaymentsParams> = new State<SearchPaymentsParams>(null);
    //statuses: State<Array<Status>> = new State<Array<Status>>(null);
    //statusesByID: State<Array<Status>> = new State<Array<Status>>(null);
    //cardTypes: State<Array<Status>> = new State<Array<CardType>>(null);
    //cardTypesByID: State<Array<Status>> = new State<Array<CardType>>(null);
    //searchPaymentsResult: State<SearchPaymentsResult> = new State<SearchPaymentsResult>(null);
    //searchingPayments: State<boolean> = new State<boolean>(false);
    //news: State<Array<any>> = new State<Array<any>>(null);
    //eventsCalendarTitle: State<string> = new State<string>(null);
    //activeLinkPreview: State<number> = new State<number>(null);
}
