import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {States} from '../providers/states';
import {Server} from '../providers/server';
import {BigPopupComponent} from './big-popup.component';
import {Utils} from '../providers/utils';
// import {Moment} from 'moment';
import {FileType, UploadFileParams} from '../classes/Interfaces';
import {FormControl, Validators} from '@angular/forms';

@Component({
    selector: 'upload-file',
    templateUrl: 'upload-file.component.html'
})

export class UploadFileComponent extends BigPopupComponent implements OnInit {

    editable: boolean;
    fileToUpload: File = null;
    filename = '';
    fileTypeFormControl: FormControl;
    firstFileTypeId: number;

    constructor(public dialogRef: MatDialogRef<any>, public states: States, private server: Server, public utils: Utils, @Inject(MAT_DIALOG_DATA) public data: any) {
        super(dialogRef);
        this.FIELDS = ['file_typeid'];
    }

    ngOnInit() {
        super.ngOnInit();
        this.updateFileTypes(this.data.file_types || []);
        this.editable = this.states.user.value.is_admin;
        this.fileTypeFormControl = new FormControl('', [
            Validators.required
        ]);
        this.states.uploadFileParams.set({
            id: null,
            exchangeid: null,
            filename: null,
            dictid: null,
            param1: null,
            param2: null,
            param3: null
        } as UploadFileParams);
    }

    updateFileTypes(fileTypes) {
        const fileTypesByID: Array<FileType> = [];
        fileTypes.forEach(fileType => {
            if (this.firstFileTypeId == undefined) {
              this.firstFileTypeId = fileType.ID;
            }
            fileTypesByID[fileType.ID] = fileType;
        });
        this.states.fileTypesByID.set(fileTypesByID);
        this.states.fileTypes.set(fileTypes);
    }

    handleFileInput(files: FileList) {
        this.fileToUpload = files.item(0);
        this.filename = this.fileToUpload.name;
    }

    upload() {
        if (this.fileTypeFormControl.valid && this.filename != '') {
            this.states.curtainVisible.set(true);
            this.states.uploadFileParams.set({
                id: this.fileTypeFormControl.value,
                exchangeid: this.states.searchFileParams.value.exchangeid,
                filename: this.filename,
                dictid: this.states.fileTypesByID.value[this.states.uploadFileParams.value.id].DICTID,
                param1: null,
                param2: null,
                param3: null
            } as UploadFileParams);
            this.server.uploadFile(this.states.uploadFileParams.value).then(response => {
                this.server.saveFile(response.FileUpload.fileid, this.fileToUpload.slice());
            }).catch(error => {
                alert(error.message);
            }).finally(() => {
                this.states.curtainVisible.set(false);
                this.cancel();
            });
        }

        /*
        let input = document.createElement('input');
        input.type = 'file';
        input.addEventListener('change', event => {
            const target = event.target as HTMLInputElement;
            const selectedFile = target.files[0];
            const uploadData = new FormData();
            uploadData.append('upload_file', selectedFile, selectedFile.name);
            //post
            input = null;
        });
        input.click();
        */
    }
}
