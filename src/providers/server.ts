import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {States} from './states';
import { md5b64 } from '../providers/md5b64';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

@Injectable()
export class Server {

    mock = false;

    requestID = 0;
    logid: string;
    token: string;
    companyid: string;
    regionid: string;

    constructor(public http: HttpClient, public states: States) {
    }

    loadTexts(): Promise<any> {
        return new Promise(resolve => {
            this.http.get('assets/json/text.json').subscribe(response => {
                resolve(response);
            });
        });
    }

    loadConfig(): Promise<any> {
        return new Promise(resolve => {
            this.http.get('config/config.json').subscribe(response => {
                resolve(response);
            });
        });
    }

    fullRequest(body: any = {}, responseType: any): Observable<HttpResponse<Object>> {
        return this.http.post<HttpResponse<Object>>(this.states.config.value.serverURL, body, {observe: 'response', responseType: responseType}).pipe(
            tap(resp => console.log('response', resp))
        );
    }

    request(method: string, params: any = {}, responseType: any = 'json'): Promise<any> {
        const paramsCopy = JSON.parse(JSON.stringify(params));
        if (this.logid != null) {
            paramsCopy.logid = this.logid;
            paramsCopy.token = this.token;
            paramsCopy.companyid = this.companyid;
            paramsCopy.regionid = this.regionid;
        }
        return new Promise((resolve, reject) => {
            this.fullRequest({
                jsonrpc: '2.0',
                method: method,
                params: paramsCopy,
                id: this.requestID++
            }, responseType
            ).subscribe(response => {
                if (responseType === 'json') {
                    if (response.body['error']) {
                        if (response.body['error'].code === -20001) {
                            if (this.states.loggedIn.value) {
                                alert(response.body['error'].message);
                                this.states.loggedIn.set(false);
                            }
                            this.states.curtainVisible.set(false);
                        } else {
                            alert('ERROR:' + response.body['error'].message);
                            reject(response.body['error']);
                        }
                    } else {
                        if (method === 'Login' || method === 'Refresh') {
                            this.logid = response.body['result'].logid;
                            this.token = response.body['result'].token;
                            this.companyid = response.body['result'].user.companyid;
                            this.regionid = response.body['result'].user.regionid;
                        }
                        // alert(JSON.stringify(response));
                        resolve(response.body['result']);
                    }
                }
                else if (responseType === 'blob') {
                    var binaryData = [];
                    binaryData.push(response.body);
                    var downloadLink = document.createElement('a');
                    downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: responseType}));
                    var filename: string;
                    try {
                        const contentDisposition: string = response.headers.get('Content-Disposition');
                        //alert(contentDisposition);
                        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                        const matches = filenameRegex.exec(contentDisposition);
                        //alert(matches);
                        if (matches != null && matches[1]) {
                            filename = matches[1].replace(/['"]/g, '');
                            downloadLink.setAttribute('download', filename);
                        }
                    }
                    catch (e) {
                        alert(e.message);
                    }
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    resolve(response);
                }
                else {
                    alert(responseType);
                    //alert('SOME ERROR:' + response['error'].message);
                    resolve(response);
                }
            }, error => {
                alert('SOME BAD ERROR:' + error.message);
                reject({code: -1});
       // reject({code: -32005});
            });
        });
    }

    login(login: string, password: string): Promise<any> {
        if (this.mock) {
            return new Promise((resolve, reject) => {
                reject(-1);
                // resolve(true);
            });
        } else {
            return this.request('Login', {login: login, password: md5b64(password), application: 'tfoms_files'});
        }
    }

    refresh(): Promise<any> {
        if (this.mock) {
            return new Promise((resolve, reject) => {
                reject(-1);
                // resolve(true);
            });
        } else {
            return this.request('Refresh');
        }
    }

    logout(): Promise<any> {
        if (this.mock) {
            return new Promise((resolve) => {
                resolve(true);
            });
        } else {
            return this.request('Logoff');
        }
    }

    resetPassword(email: string): Promise<any> {
        if (this.mock) {
            return new Promise(resolve => {
                resolve(true);
            });
        } else {
            return this.request('ResetPassword', {email: email});
        }
    }

    changePassword(password: string): Promise<any> {
        if (this.mock) {
            return new Promise(resolve => {
                resolve(true);
            });
        } else {
            return this.request('ChangePassword', {password: password});
        }
    }

    getExchanges(params: any): Promise<any> {
        if (this.mock) {
            return new Promise(resolve => {
                resolve([]);
            });
        } else {
            return this.request('Exchanges', params);
        }
    }

    getFiles(params: any): Promise<any> {
        if (this.mock) {
            return new Promise(resolve => {
                resolve([]);
            });
        } else {
            return this.request('Files', params);
        }
    }

    downloadFile(fileid: string): Promise<any> {
        if (this.mock) {
            return new Promise(resolve => {
                resolve('');
            });
        } else {
            return this.request('FileBlob', {fileid: fileid}, 'blob');
        }
    }

    getFileTypes(exchangeid: number): Promise<any> {
        if (this.mock) {
            return new Promise(resolve => {
                resolve([]);
            });
        } else {
            return this.request('FileTypes', {exchangeid: exchangeid});
        }
    }

    exportExchangesList(params: any): Promise<any> {
        if (this.mock) {
            return new Promise(resolve => {
                resolve([]);
            });
        } else {
            return this.request('ExchangesExport', params);
        }
    }

    exportFilesList(params: any): Promise<any> {
        if (this.mock) {
            return new Promise(resolve => {
                resolve([]);
            });
        } else {
            return this.request('FilesExport', params);
        }
    }

}
