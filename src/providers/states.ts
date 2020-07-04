import {Injectable} from '@angular/core';
import {State} from '../classes/State';
import {
    Exchange, SearchExchangeParams, SearchExchangeResult,
    ExchangeGroup, ExchangeType,
    File, SearchFileParams, SearchFileResult,
    CompanyRegion,
    UploadFileParams,
    FileType,
    User
} from '../classes/Interfaces';

@Injectable()
export class States {
    lang: State<string> = new State<string>('');
    texts: State<any> = new State<any>(null);
    config: State<any> = new State<any>(null);
    initComplete: State<boolean> = new State<boolean>(false);
    curtainVisible: State<boolean> = new State<boolean>(false);
    selectedMenu: State<string> = new State<string>('');

    loginError: State<string> = new State<string>('');
    loginErrorVisible: State<boolean> = new State<boolean>(false);

    user: State<User> = new State<User>(null);
    loggedIn: State<boolean> = new State<boolean>(false);

    companyRegion: State<Array<CompanyRegion>> = new State<Array<CompanyRegion>>(null);
    companyRegionByID: State<Array<CompanyRegion>> = new State<Array<CompanyRegion>>(null);
    exchangeGroups: State<Array<ExchangeGroup>> = new State<Array<ExchangeGroup>>(null);
    exchangeGroupsByID: State<Array<ExchangeGroup>> = new State<Array<ExchangeGroup>>(null);
    exchangeTypes: State<Array<ExchangeType>> = new State<Array<ExchangeType>>(null);
    exchangeTypesByID: State<Array<ExchangeType>> = new State<Array<ExchangeType>>(null);
    exchangeTypesByGroupID: State<Array<Array<ExchangeType>>> = new State<Array<Array<ExchangeType>>>(null);
    fileTypes: State<Array<FileType>> = new State<Array<FileType>>(null);
    fileTypesByID: State<Array<FileType>> = new State<Array<FileType>>(null);

    exchanges: State<Array<Exchange>> = new State<Array<Exchange>>(null);
    searchExchangeParams: State<SearchExchangeParams> = new State<SearchExchangeParams>(null);
    searchExchangeResult: State<SearchExchangeResult> = new State<SearchExchangeResult>(null);
    searchExchangeFiltersExpanded: State<boolean> = new State<boolean>(false);
    searchingExchanges: State<boolean> = new State<boolean>(false);
    selectedExchangesIDs: State<Array<string>> = new State<Array<string>>([]);
    selectedExchangesAction: State<string> = new State<string>(null);

    files: State<Array<File>> = new State<Array<File>>(null);
    searchFileParams: State<SearchFileParams> = new State<SearchFileParams>(null);
    searchFileResult: State<SearchFileResult> = new State<SearchFileResult>(null);
    searchFileFiltersExpanded: State<boolean> = new State<boolean>(false);
    searchingFiles: State<boolean> = new State<boolean>(false);
    selectedFilesIDs: State<Array<string>> = new State<Array<string>>([]);
    selectedFilesAction: State<string> = new State<string>(null);

    uploadFileParams: State<UploadFileParams> = new State<UploadFileParams>(null);
}
