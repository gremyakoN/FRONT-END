import {Component, Input, OnChanges} from '@angular/core';
import {Server} from '../providers/server';
import {Utils} from '../providers/utils';
import {HttpClient} from '@angular/common/http';

@Component({
    selector: 'link-preview',
    templateUrl: 'link-preview.component.html'
})

export class LinkPreviewComponent implements OnChanges {

    title: string;
    description: string;
    imgURL: string;
    gettingData: boolean;
    realURL: string;

    @Input() url: string;

    constructor(private server: Server, private http: HttpClient, private utils: Utils) {
    }

    ngOnChanges() {
        if (this.url && !this.title) {
            this.gettingData = true;
            this.realURL = (this.url.indexOf('http') === 0) ? this.url : 'http://' + this.url;
            this.server.proxy(this.realURL).then(response => {
                this.gettingData = false;
                response.toString().split('<meta ').forEach(line => {
                    const strippedLine = line.substring(0, line.indexOf('>'));
                    if (!this.title) {
                        if ((strippedLine.indexOf('og:site_name') !== -1) || (strippedLine.indexOf('og:title') !== -1) || (strippedLine.indexOf('title') !== -1)) {
                            this.title = this.getContent(strippedLine);
                        }
                    }
                    if (!this.imgURL) {
                        if (strippedLine.indexOf('og:image') !== -1) {
                            let quote;
                            if (strippedLine.indexOf('\'') !== -1) {
                                quote = '\'';
                            } else if (strippedLine.indexOf('\"') !== -1) {
                                quote = '\"';
                            }
                            this.imgURL = strippedLine.split('content=' + quote)[1].split(quote)[0];
                        }
                    }
                    if ((strippedLine.indexOf('og:description') !== -1) || (strippedLine.indexOf('description') !== -1)) {
                        this.description = this.getContent(strippedLine);
                    }
                });
                if (!this.title) {
                    this.title = this.url;
                }
            }).catch(error => {
                this.url = null;
                console.error('proxy error', error);
            });
        }
    }

    getContent(str: string): string {
        const contentPlus = str.split('content=')[1];
        const quote = ((contentPlus.charAt(0) === '\'') || (contentPlus.charAt(0) === '\"')) ? contentPlus.charAt(0) : '';
        return this.utils.decodeHTML(contentPlus.split(quote)[1]);
    }
}
