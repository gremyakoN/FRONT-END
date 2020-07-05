import {Component, Inject, OnInit} from '@angular/core';
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
        this.FIELDS = [
            'file_typeid',
            'file'

        ];

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

    doitdoit() {
        //this.fileToUpload.name
    }

    handleFileInput(files: FileList) {
        this.fileToUpload = files.item(0);
    }

    upload() {
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
            input.click();
        });
    }

    download() {
        //
    }

    process() {
        //
    }
}
