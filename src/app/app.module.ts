import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from './material.module';
import {Server} from '../providers/server';
import {States} from '../providers/states';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TextLabelComponent} from '../components/text-label';
import {ResetPasswordComponent} from '../components/reset-password.component';
import {UserInfoComponent} from '../components/user-info.component';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material';
import {MAT_MOMENT_DATE_FORMATS} from '@angular/material-moment-adapter';
import {TableSortComponent} from '../components/table-sort.component';
import {Utils} from '../providers/utils';
import {LinkPreviewComponent} from '../components/link-preview.component';
import {RuDateAdapter} from '../classes/RuDateAdapter';

import {SearchExchangeFiltersComponent} from '../components/search-exchange-filters.component';
import {SearchExchangeResultsComponent} from '../components/search-exchange-results.component';
import {SelectedExchangesComponent} from '../components/selected-exchanges.component';

import {SearchFileFiltersComponent} from '../components/search-file-filters.component';
import {SearchFileResultsComponent} from '../components/search-file-results.component';
import {SelectedFilesComponent} from '../components/selected-files.component';

import {ChangePasswordComponent} from '../components/change-password.component';
import {UploadFileComponent} from '../components/upload-file.component';
import {ExportDialogComponent} from '../components/export-dialog.component';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule
    ],
    declarations: [
        AppComponent,
        TextLabelComponent,
        LinkPreviewComponent,
        ResetPasswordComponent,
        UserInfoComponent,
        ChangePasswordComponent,
        TableSortComponent,

        SearchExchangeFiltersComponent,
        SearchExchangeResultsComponent,
        SelectedExchangesComponent,

        SearchFileFiltersComponent,
        SearchFileResultsComponent,
        SelectedFilesComponent,
        UploadFileComponent,
        ExportDialogComponent
    ],
    providers: [
        States,
        Server,
        Utils,
        {provide: MAT_DATE_LOCALE, useValue: 'ru-RU'},
        {provide: DateAdapter, useClass: RuDateAdapter, deps: [MAT_DATE_LOCALE]},
        {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS}
    ],
    entryComponents: [
        ResetPasswordComponent,
        ChangePasswordComponent,
        SelectedExchangesComponent,
        SelectedFilesComponent,
        UploadFileComponent,
        ExportDialogComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
