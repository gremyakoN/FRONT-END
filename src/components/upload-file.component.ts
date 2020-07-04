import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {States} from '../providers/states';
import {Server} from '../providers/server';
import {BigPopupComponent} from './big-popup.component';
import {Utils} from '../providers/utils';
// import {Moment} from 'moment';
import {FileType} from '../classes/Interfaces';

@Component({
    selector: 'upload-file',
    templateUrl: 'upload-file.component.html'
})

export class UploadFileComponent extends BigPopupComponent implements OnInit {

    editable: boolean;
    fileToUpload: File = null;

    constructor(public dialogRef: MatDialogRef<any>, public states: States, private server: Server, public utils: Utils, @Inject(MAT_DIALOG_DATA) public data: any) {
        super(dialogRef);
    }

    ngOnInit() {
        super.ngOnInit();
        // alert(JSON.stringify(this.data));
        // states.fileTypes
        this.updateFileTypes(this.data.file_types || []);

        // this.adding = true;
        this.editable = this.states.user.value.is_admin;
        // this.editable = false;
    }

    updateFileTypes(fileTypes) {
        const fileTypesByID: Array<FileType> = [];
        fileTypes.forEach(fileType => {
            fileTypesByID[fileType.ID] = fileType;
        });
        this.states.fileTypesByID.set(fileTypesByID);
        this.states.fileTypes.set(fileTypes);
    }

    handleFileInput(files: FileList) {
        this.fileToUpload = files.item(0);
    }

    doitdoit() {
        let input = document.createElement('input');
        input.type = 'file';
        input.addEventListener('change', event => {
            const target = event.target as HTMLInputElement;
            const selectedFile = target.files[0];
            const uploadData = new FormData();
            uploadData.append('upload_file', selectedFile, selectedFile.name);
            // непосредственно отправить файл (post запрос)
            input = null;
        });
        input.click();
    }

    upload() {

        /*
        this.addFile().then(result => {
            this.states.curtainVisible.set(true);
            this.server.getExchangeFiles(this.data.exchangeId).then(response => {
                // this.states.exchangeFilesResult.set(response);
                response.exchangeId = this.data.exchangeId;
                this.data = response;
            }).catch(error => {
                alert(error.message);
            }).finally(() => {
                this.states.curtainVisible.set(false);
            });
        });
        */
    }

    addFile(resize: boolean = false): Promise<string> {
        return new Promise(resolve => {
            const input: HTMLInputElement = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/jpeg';
            input.value = null;
            input.addEventListener('change', (event: any) => {
                const reader = new FileReader();
                reader.readAsDataURL(event.target.files[0]);
                reader.onload = () => {
                    if (resize) {
                        const img = new Image();
                        img.src = reader.result.toString();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            canvas.width = 248;
                            canvas.height = Math.ceil((248 / img.width) * img.height);
                            const context = canvas.getContext('2d');
                            context.drawImage(img, 0, 0, canvas.width, canvas.height);
                            resolve(canvas.toDataURL('image/jpeg').substring(23));
                        };
                    } else {
                        resolve(reader.result.toString().substring(23));
                    }
                };
            });
            window.requestAnimationFrame(() => {
                input.click();
            });
        });
    }

    download() {
        //
    }

    process() {
        //
    }
/*
    updateMemberCard() {
        this.filterCommittees('');
        this.updateCommitteeName();
        this.filterPrimaryOrganizations('');
        this.updatePrimaryOrganizationName();
        this.updateIssuedByName();
        if (this.data.transfers) {
            this.data.transfers.reverse();
        }
        if (this.data.member.photo_id !== undefined) {
            this.data.member.photo = '';
            this.server.loadImage(this.data.member.photo_id).then(result => {
                this.data.member.photo = result.image;
            });
        }
    }

    loadPassport() {
        this.data.member.passport = '';
        this.server.loadImage(this.data.member.passport_id).then(result => {
            this.data.member.passport = result.image;
        });
    }

    changeCommittee(accepted: boolean) {
        this.states.curtainVisible.set(true);
        this.server.changeCommittee(this.data.member.id, accepted).then(response => {
            if (accepted) {
                this.data = response;
                this.updateMemberCard();
            } else {
                this.dialogRef.close({});
            }
        }).catch(error => {
            this.processError(error);
            console.error('changeCommittee error:', error);
        }).finally(() => {
            this.states.curtainVisible.set(false);
        });
    }

    save() {
        this.states.curtainVisible.set(true);
        const params: any = JSON.parse(JSON.stringify(this.data.member));
        if (params.photo_id !== null) {
            delete params.photo;
        }
        if (params.passport_id !== null) {
            delete params.passport;
        }
        const assignment_id = params.assignment_id;
        delete params.assignment_id;
        if (!this.adding) {
            if (this.states.user.value.hierarchy_level !== 4) {
                if (params.committee_id !== this.initialCommitteeID) {
                    params.committee_id_new = params.committee_id;
                    params.committee_id = this.initialCommitteeID;
                }
            }
        }
        this.saveMember(params).then(member => {
            this.saveAcceptEntryFee().then(() => {
                this.saveAssignment(assignment_id, member).then(() => {
                    this.dialogRef.close(member);
                }).catch(() => {
                }).finally(() => {
                    this.states.curtainVisible.set(false);
                });
            });
        }).catch(() => {
        }).finally(() => {
            this.states.curtainVisible.set(false);
        });
    }

    saveMember(params): Promise<any> {
        return new Promise((resolve, reject) => {
            if ((this.states.user.value.hierarchy_level === 1) || (this.states.user.value.hierarchy_level === 4)) {
                const serverCommand: Function = this.adding ? this.server.addMember : this.server.updateMember;
                serverCommand.bind(this.server)(params).then(response => {
                    resolve(response.member);
                }).catch(error => {
                    this.processError(error);
                    console.error('saveMember error:', error);
                    reject();
                });
            } else {
                resolve();
            }
        });
    }

    saveAcceptEntryFee(): Promise<any> {
        return new Promise(resolve => {
            if (((this.states.user.value.hierarchy_level === 2) || (this.states.user.value.hierarchy_level === 4)) && this.acceptEntryFee) {
                this.server.acceptEntryFee(this.data.member.id).then(() => {
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    saveAssignment(assignment_id, member): Promise<any> {
        return new Promise((resolve, reject) => {
            if ((assignment_id) && (this.initialAssignmentID !== assignment_id)) {
                this.server.changeAssignment(member.id, assignment_id).then(response => {
                    resolve();
                }).catch(error => {
                    this.processError(error);
                    console.error('changeAssignment error:', error);
                    reject();
                }).finally(() => {
                    this.states.curtainVisible.set(false);
                });
            } else {
                resolve();
            }
        });
    }

    fieldChanged(field: string, event: any) {
        this.data.member[field] = event.target ? event.target.value : (event.source.selected ? event.source.selected.value : event.source.checked);
    }

    dateFieldChanged(field: string, value: Moment) {
        this.data.member[field] = value ? this.utils.convertToJAVADate(value) : null;
        this.updateIs18();
    }

    updateIs18() {
        const currentDateMinus18Years = new Date();
        currentDateMinus18Years.setFullYear(currentDateMinus18Years.getFullYear() - 18);
        this.is18 = (currentDateMinus18Years.getTime() >= new Date(this.data.member.date_of_birth).getTime());
    }

    committeeFocused() {
        this.filterCommittees('');
        this.formControls['committee_id'].reset('');
    }

    committeeBlurred() {
        this.updateCommitteeName();
    }

    updateCommitteeName() {
        this.formControls['committee_id'].reset((this.data.member.committee_id !== undefined) ? this.states.committeesByID.value[this.data.member.committee_id].name : '', {emitEvent: false});
    }

    issuedByFocused() {
        this.filterCommittees('');
        this.formControls['card_issued_by'].reset('');
    }

    issuedByBlurred() {
        this.updateIssuedByName();
    }

    updateIssuedByName() {
        this.formControls['card_issued_by'].reset((this.data.member.card_issued_by !== undefined) ? this.states.committeesByID.value[this.data.member.card_issued_by].name : '', {emitEvent: false});
    }

    filterCommittees(value: string) {
        if ((typeof (value) === 'string') && ((this.states.user.value.hierarchy_level === 4) || !this.adding)) {
            const lowerCaseValue = value.toLowerCase();
            this.filteredCommittees = this.states.committees.value.filter(option => {
                if (option) {
                    return option.name.toLowerCase().includes(lowerCaseValue);
                }
            });
        }
    }

    selectCommittee(committee: Committee, target: any) {
        this.data.member.committee_id = committee.id;
        target.blur();
        this.updateCommitteeName();
    }

    updatePrimaryOrganizationName() {
        this.formControls['primary_organization_id'].reset(this.data.member.primary_organization_id ? this.states.primaryOrganizationsByID.value[this.data.member.primary_organization_id].name : '', {emitEvent: false});
    }

    filterPrimaryOrganizations(value: string) {
        if ((typeof (value) === 'string') && (this.states.primaryOrganizations.value)) {
            const lowerCaseValue = value.toLowerCase();
            //const availablePrimaryOrganizations: Array<PrimaryOrganization> = [];
            this.fillAvailablePrimaryOrganization(this.data.member.committee_id, availablePrimaryOrganizations);
           // this.filteredPrimaryOrganizations = availablePrimaryOrganizations.filter(primaryOrganization => {
                return primaryOrganization.name.toLowerCase().includes(lowerCaseValue);
            });
        }
    }

    fillAvailablePrimaryOrganization(committeeID: string, availablePrimaryOrganizations) {
        const primaryOrganizations = this.states.primaryOrganizationsByCommittee.value[committeeID];
        if (primaryOrganizations) {
            primaryOrganizations.forEach(primaryOrganization => {
                availablePrimaryOrganizations.push(primaryOrganization);
            });
        } else {
            const committee: Committee = this.states.committeesByID.value[committeeID];
            if (committee && committee.children && committee.children.length) {
                committee.children.forEach(child => {
                    this.fillAvailablePrimaryOrganization(child.id, availablePrimaryOrganizations);
                });
            }
        }
    }

    primaryOrganizationFocused() {
        this.filterPrimaryOrganizations('');
        this.formControls['primary_organization_id'].reset('', {emitEvent: false});
    }

    primaryOrganizationBlurred() {
        this.updatePrimaryOrganizationName();
    }

    selectPrimaryOrganization(primaryOrganization: PrimaryOrganization, target: any) {
        this.data.member.primary_organization_id = primaryOrganization ? primaryOrganization.id : null;
        this.updatePrimaryOrganizationName();
        target.blur();
    }

    selectIssuedBy(committee: Committee, target: any) {
        this.data.member.card_issued_by = committee.id;
        target.blur();
        this.updateIssuedByName();
    }

    addPhoto() {
        this.addFile(true).then(result => {
            this.data.member.photo_id = null;
            this.data.member.photo = result;
        });
    }



    showImage(field: string) {
        this.bigImage = this.data.member[field];
    }

    hideImage() {
        this.bigImage = null;
    }

    zoomOut() {
        const currentZoom = this.currentZoom();
        if (currentZoom === 2) {
            this.bigImageElement.nativeElement.style.width = null;
        } else {
            this.bigImageElement.nativeElement.style.width = 100 * currentZoom / 2 + '%';
        }
    }

    zoomIn() {
        this.bigImageElement.nativeElement.style.width = 100 * this.currentZoom() * 2 + '%';
    }

    currentZoom(): number {
        let currentZoom = 1;
        if (this.bigImageElement.nativeElement.style.width) {
            currentZoom = parseInt(this.bigImageElement.nativeElement.style.width, 10) / 100;
        }
        return currentZoom;
    }

    print() {
        this.utils.printImage(this.bigImage);
    }

    setOption(option, value) {
        if (this.utils.optionEnabled(option, this.data.member.options) !== value) {
            this.data.member.options = this.data.member.options + (value ? option : -option);
        }
    }

    setAcceptEntryFee(value) {
        this.acceptEntryFee = value;
    }
*/
}
