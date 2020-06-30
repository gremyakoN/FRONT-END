import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {States} from './states';
/*
import {
    Exchange,
    SearchExchangeParams
    //Article,
    //Assignment,
    //CalendarEvent,
    //Category,
    //Committee,
    //PrimaryOrganization,
    //Promotion,
    //SearchParams,
    //SearchPaymentsParams
} from '../classes/Interfaces';
*/
import { md5b64 } from '../providers/md5b64';

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

    request(method: string, params: any = {}, responseType: any = 'json'): Promise<any> {
        const paramsCopy = JSON.parse(JSON.stringify(params));
        if (this.logid != null) {
            paramsCopy.logid = this.logid;
            paramsCopy.token = this.token;
            paramsCopy.companyid = this.companyid;
            paramsCopy.regionid = this.regionid;
        }
        return new Promise((resolve, reject) => {
            this.http.post(this.states.config.value.serverURL, {
                jsonrpc: '2.0',
                method: method,
                params: paramsCopy,
                id: this.requestID++
            }, {
                responseType: responseType
            }).subscribe(response => {
                if (responseType === 'json') {
                    if (response['error']) {
                        if (response['error'].code === -20001) {
                            if (this.states.loggedIn.value) {
                                alert(response['error'].message);
                                this.states.loggedIn.set(false);
                            }
                            this.states.curtainVisible.set(false);
                        } else {
                            alert('ERROR:' + response['error'].message);
                            reject(response['error']);
                        }
                    } else {
                        if (method === 'Login' || method === 'Refresh') {
                            this.logid = response['result'].logid;
                            this.token = response['result'].token;
                            this.companyid = response['result'].user.companyid;
                            this.regionid = response['result'].user.regionid;
                        }
                        // alert(JSON.stringify(response));
                        resolve(response['result']);
                    }
                } else {
                    alert('SOME ERROR:' + response['error'].message);
                    resolve(response);
                }
            }, error => {
                alert('SOME BAD ERROR:' + error.message);
                reject({code: -1});
//       reject({code: -32005});
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

    getExchangeFiles(exchangeid: number): Promise<any> {
        if (this.mock) {
            return new Promise(resolve => {
                resolve([]);
            });
        } else {
            return this.request('Files', {exchangeid: exchangeid});
        }
    }

    uploadFile(id: string): Promise<any> {
        if (this.mock) {
            return new Promise(resolve => {
                resolve('');
            });
        } else {
            return this.request('UploadFile', {id: id});
        }
    }

    getFileTypes(exchangetypeid: number): Promise<any> {
        if (this.mock) {
            return new Promise(resolve => {
                resolve([]);
            });
        } else {
            return this.request('File_Types', {exchange_typeid: exchangetypeid});
        }
    }
    /*

        updateCommittee(committee: Committee): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('UpdateCommittee', committee);
            }
        }

        deleteCommittee(committee: Committee): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('DeleteCommittee', {id: committee.id});
            }
        }

        addCommittee(committee: Committee): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('InsertCommittee', committee);
            }
        }

        updatePrimaryOrganization(primaryOrganization: PrimaryOrganization): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('UpdatePrimaryOrganization', primaryOrganization);
            }
        }

        deletePrimaryOrganization(primaryOrganization: PrimaryOrganization): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('DeletePrimaryOrganization', {id: primaryOrganization.id});
            }
        }

        addPrimaryOrganization(primaryOrganization: PrimaryOrganization): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('InsertPrimaryOrganization', primaryOrganization);
            }
        }

        updateAssignment(assignment: Assignment): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('UpdateAssignment', assignment);
            }
        }

        deleteAssignment(assignment: Assignment): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('DeleteAssignment', {id: assignment.id});
            }
        }

        addAssignment(assignment: Assignment): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('InsertAssignment', assignment);
            }
        }

        updateCategory(category: Category): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('UpdateCategory', category);
            }
        }

        deleteCategory(category: Category): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('DeleteCategory', {id: category.id});
            }
        }

        addCategory(category: Category): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('InsertCategory', category);
            }
        }

        updatePromotion(promotion: Promotion): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('UpdatePromotion', promotion);
            }
        }

        deletePromotion(promotion: Promotion): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('DeletePromotion', {id: promotion.id});
            }
        }

        addPromotion(promotion: Promotion): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('InsertPromotion', promotion);
            }
        }

        getMembers(params: any): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve([]);
                });
            } else {
                return this.request('GetMembers', params);
            }
        }

        getPayments(params: any): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve([]);
                });
            } else {
                return this.request('GetPayments', params);
            }
        }

        payedWithCash(membersIDs: Array<string>): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('PayInCash', {payment_members: membersIDs});
            }
        }

        applyPromotion(membersIDs: Array<string>, promotionID: string, value: number): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('SetMark', {promotion_members: membersIDs, promotion_id: promotionID, value: value});
            }
        }

        changeCategory(membersIDs: Array<string>, categoryID: string): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('ChangeCategory', {category_members: membersIDs, category_id: categoryID});
            }
        }

        exportMembers(params: SearchParams): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve('');
                });
            } else {
                return this.request('ExportMembers', params, 'text');
            }
        }

        exportPayments(params: SearchPaymentsParams): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve('');
                });
            } else {
                return this.request('ExportPayments', params, 'text');
            }
        }

        getMember(id: string): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve({});
                });
            } else {
                return this.request('GetMember', {id: id});
            }
        }



        addMember(params: any): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve({});
                });
            } else {
                return this.request('InsertMember', params);
            }
        }

        updateMember(params: any): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve({});
                });
            } else {
                return this.request('UpdateMember', params);
            }
        }

        changeAssignment(id: string, assignmentID: string): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('ChangeAssignment', {id: id, assignment_id: assignmentID});
            }
        }

        addArticle(article: Article): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('InsertNews', article);
            }
        }

        updateArticle(article: Article): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('UpdateNews', article);
            }
        }

        deleteArticle(articleID: string): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('DeleteNews', {id: articleID});
            }
        }

        addEvent(event: CalendarEvent): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('InsertEvent', event);
            }
        }

        updateEvent(event: CalendarEvent): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('UpdateEvent', event);
            }
        }

        deleteEvent(eventID: string): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('DeleteEvent', {id: eventID});
            }
        }

        applyEventMark(eventID: string): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('SetMarkByCheckIn', {event_id: eventID});
            }
        }

        checkIn(members: Array<string>, eventID: string): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('CheckIn', {event_id: eventID, event_members: members});
            }
        }

        changeCommittee(members: Array<string>, accepted: boolean): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('ChangeCommittee', {id: members, accept: accepted});
            }
        }

        getReport(from: string, to: string): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('GetReport', {date_from: from, date_to: to});
            }
        }

        acceptEntryFee(id: string): Promise<any> {
            if (this.mock) {
                return new Promise(resolve => {
                    resolve(true);
                });
            } else {
                return this.request('AcceptEntryFee', {id: id});
            }
        }
    */
    proxy(url: string): Promise<any> {
        if (this.mock) {
            return new Promise(resolve => {
                resolve('');
            });
        } else {
            return new Promise((resolve, reject) => {
                this.http.get(this.states.config.value.proxyServerURL + url, {
                    responseType: 'text'
                }).subscribe(response => {
                    resolve(response);
                }, error => {
                    reject(error);
                });
            });
        }
    }

}
