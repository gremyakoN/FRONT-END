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
//import {CommitteeDetailsComponent} from '../components/committee-details.component';
//import {PrimaryOrganizationDetailsComponent} from '../components/primary-organization-details.component';
import {UserInfoComponent} from '../components/user-info.component';
//import {AssignmentEditComponent} from '../components/assignment-edit.component';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material';
//import {CategoryEditComponent} from '../components/category-edit.component';
//import {PromotionEditComponent} from '../components/promotion-edit.component';
import {TableSortComponent} from '../components/table-sort.component';
import {SearchFiltersComponent} from '../components/search-filters.component';

//import {SearchResultsComponent} from '../components/search-results.component';
//import {SelectedMembersComponent} from '../components/selected-members.component';
//import {PromotionSelectComponent} from '../components/promotion-select.component';
//import {CategorySelectComponent} from '../components/category-select.component';
//import {ExportDialogComponent} from '../components/export-dialog.component';
//import {MemberDetailsComponent} from '../components/member-details.component';
import {Utils} from '../providers/utils';
import {MAT_MOMENT_DATE_FORMATS} from '@angular/material-moment-adapter';
//import {AddArticleComponent} from '../components/add-article.component';
import {FullCalendarModule} from '@fullcalendar/angular';
//import {ColorPickerComponent} from '../components/color-picker.component';
//import {AddEventComponent} from '../components/add-event.component';
//import {EventSelectComponent} from '../components/event-select.component';
//import {CommitteeSelectComponent} from '../components/committee-select.component';
//import {SearchPaymentsFiltersComponent} from '../components/search-payments-filters.component';
//import {SearchPaymentsResultsComponent} from '../components/search-payments-results.component';
//import {PaymentsReportComponent} from '../components/payments-report.component';
import {ChangePasswordComponent} from '../components/change-password.component';
import {LinkPreviewComponent} from '../components/link-preview.component';
import {RuDateAdapter} from '../classes/RuDateAdapter';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        FullCalendarModule
    ],
    declarations: [
        AppComponent,
        TextLabelComponent,
        ResetPasswordComponent,
        //CommitteeDetailsComponent,
        //PrimaryOrganizationDetailsComponent,
        UserInfoComponent,
        //AssignmentEditComponent,
        //CategoryEditComponent,
        //PromotionEditComponent,
        TableSortComponent,
        SearchFiltersComponent,
        //SearchResultsComponent,
        //SelectedMembersComponent,
        //PromotionSelectComponent,
        //CategorySelectComponent,
        //ExportDialogComponent,
        //MemberDetailsComponent,
        //AddArticleComponent,
        //ColorPickerComponent,
        //AddEventComponent,
        //EventSelectComponent,
        //CommitteeSelectComponent,
        //SearchPaymentsFiltersComponent,
        //SearchPaymentsResultsComponent,
        //PaymentsReportComponent,
        ChangePasswordComponent,
        LinkPreviewComponent
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
        //CommitteeDetailsComponent,
        //PrimaryOrganizationDetailsComponent,
        //AssignmentEditComponent,
        //CategoryEditComponent,
        //PromotionEditComponent,
        //SelectedMembersComponent,
        //PromotionSelectComponent,
        //CategorySelectComponent,
        //ExportDialogComponent,
        //MemberDetailsComponent,
        //AddArticleComponent,
        //ColorPickerComponent,
        //AddEventComponent,
        //EventSelectComponent,
        //CommitteeSelectComponent,
        //PaymentsReportComponent,
        ChangePasswordComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
