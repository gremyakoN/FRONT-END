import {Moment} from 'moment';

export interface User {
    userid: number;
    clnid: number;
    name: string;
    regionid: number;
    companyid: number;
    is_admin: boolean;
}

export interface ExchangeGroup {
    ID: number;
    NAME: string;
}

export interface ExchangeType {
    ID: number;
    NAME: string;
    CODE: string;
    GROUPID: number;
}

export interface Exchange {
    ID: number;
    REGIONID: number;
    NAME: string;
    CODE: string;
    EXCHANGEDATE: string;
    EXCHANGETYPEID: number;
    FILECOUNT: number;
    FILEFORMED: number;
    RECCOUNT: number;
    PARENTID: number;
    // children: Array<Exchange>;
}

export interface SearchExchangeParams {
    fromdate: string;
    fromdate_moment: Moment;
    todate: string;
    todate_moment: Moment;
    exchange_groupid: number;
    exchange_typeid: number;
    page_number: number;
    page_size: number;
    order_by: string;
    order_type: string;
}

export interface SearchExchangeResult {
    Exchanges: Array<Exchange>;
}

export interface File {
    ID: number;
    NAME: string;
    CODE: string;
    FILENAME: string;
    FILEDATE: string;
    MODIFDATE: string;
    FILETYPE: string;
    EXCHTYPE: string;
    FILEFORMED: number;
    FILECATEGORYID: number;
    MAILID: number;
    MAILNAME: string;
    MAILTEXT: string;
    FLKID: number;
    RECCOUNT: number;
    DIRECTIONID: number;
    ERRCOUNTCount: number;
    ISACK1: number;
    ISACK2: number;
    ERRCHECKED: number;
    PARENTID: number;
    //children: Array<File>;
    PARENT_EXCHANGEID: number;
    //childrenExch: Array<Exchange>;
    PROCESSSTATEID: number;
    FILESIZE: number;
}

/*
export interface ExchangeFilesResult {
    Files: Array<File>;
}
*/

export interface CompanyRegion {
    id: number;
    regionid: number;
    companyid: number;
    name: string;
}

/*
export interface Assignment {
    id: string;
    name: string;
    is_admin: boolean;
    hierarchy_level: number;
}

export interface Committee {
    id: number;
    parent_id: number;
    unp: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    iban: string;
    bic: string;
    service_no: string;
    children: Array<Committee>;
}

export interface Category {
    id: string;
    name: string;
    amount: number;
}

export interface Promotion {
    id: string;
    name: string;
    max_value: number;
    min_value: number;
}

export interface PrimaryOrganization {
    id: string;
    committee_id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
}

export interface CalendarEvent {
    id: string;
    committee_id: string;
    name: string;
    address: string;
    date_from: string;
    date_to: string;
    phone: string;
    additional_info: string;
    latitude: number;
    longitude: number;
    mark: number;
    editable: boolean;
    color: string;
}

export interface FullCalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    color: string;
}

export interface SearchParams {
    page_number: number;
    page_size: number;
    order_by: string;
    order_type: string;
    search_like: string;
    primary_organization_id: string;
    assignment_id: string;
    status: string;
    card_type: string;
    min_age: number;
    max_age: number;
    min_inserted: string;
    max_inserted: string;
    min_inserted_date: Moment;
    max_inserted_date: Moment;
    with_photo: boolean;
    with_passport: boolean;
    is_debtor: boolean;
    is_transfer: boolean;
    event_id: string;
    min_mark: number;
    max_mark: number;
    category_id: number;
}

export interface SearchPaymentsParams {
    page_number: number;
    page_size: number;
    order_by: string;
    order_type: string;
    search_like: string;
    committee_id: string;
    period: string;
    is_erip: boolean;
}

export interface Status {
    id: string;
    name: string;
}

export interface CardType {
    id: string;
    name: string;
}

export interface SearchResult {
    members: Array<SearchResultMember>;
    count: number;
}

export interface SearchPaymentsResult {
    payments: Array<SearchResultPayment>;
    count: number;
}

export interface SearchResultMember {
    id: string;
    surname: string;
    firstname: string;
    patronymic: string;
    age: number;
    phone: string;
    email: string;
    status: string;
    assignment_id: string;
    primary_organization_id: string;
    mark: string;
}

export interface SearchResultPayment {
    member_id: string;
    card_number: string;
    full_name: string;
    committee_id: string;
    amount: number;
    period: string;
    transaction_result: string;
    transaction_id: string;
    initiator: string;
}

export interface Article {
    committee_id: string;
    event_id: string;
    name: string;
    additional_info: string;
    link: string;
    editable: boolean;
}
*/
