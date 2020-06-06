import {Injectable} from '@angular/core';
import {Moment} from 'moment';
import iro from '@jaames/iro';

@Injectable()
export class Utils {

    imgPrefix = 'data:image/jpeg;base64,';

    constructor() {
    }

    convertToJAVADate(date: Moment): string {
        return date.format('YYYY-MM-DD');
    }

    formatJavaDate(dateStr: string, withSeconds: boolean = false): string {
        const date: Date = new Date(dateStr);
        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit'
        };
        if (withSeconds) {
            timeOptions['second'] = '2-digit';
        }
        return date.toLocaleDateString('ru') + ' ' + date.toLocaleTimeString('ru', timeOptions);
    }

    printImage(imgSrc) {
        this.printHTML('<img src="' + imgSrc + '" style="width: 100%;" />');
    }

    printHTML(data: string, styles: string = null) {
        const content = '<!DOCTYPE html>' +
            '<html>' +
            '<head><title></title></head>' +
            '<body onload="window.focus(); window.print(); window.close();">' +
            (styles ? '<style>' + styles + '</style>'  : '') +
            data +
            '</body>' +
            '</html>';
        const printWindow = window.open('', 'print', 'toolbar=no,location=no,directories=no,menubar=no,scrollbars=yes');
        printWindow.document.open();
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();
    }

    toMoney(value): string {
        return value.toFixed(2);
    }

    windowOpen(url: string, target: string) {
        window.open(url, target);
    }

    optionEnabled(num: number, options: number): boolean {
        for (let i = 4; i >= 1; i = i / 2) {
            if (options >= i) {
                if (num === i) {
                    return true;
                } else {
                    options -= i;
                }
            }
        }
        return false;
    }

    getContrastTextColor(hexString: string): string {
        const iroColor = new iro.Color(hexString);
        return (this.calculateLuminance(iroColor.rgb) > 0.179) ? '#000000' : '#FFFFFF';
    }

    decodeHTML(html) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }

    toUnicode(str: string): string {
        return str.split('').map(value => {
            const temp = value.charCodeAt(0).toString(16).toUpperCase();
            if (temp.length > 2) {
                return '\\u' + temp;
            }
            return value;
        }).join('');
    }

    private calculateLuminance(color) {
        return 0.2126 * this.calculateLight(color.r) + 0.7152 * this.calculateLight(color.g) + 0.0722 * this.calculateLight(color.b);
    }

    private calculateLight(colorItem) {
        let c = colorItem / 255.0;
        if (c <= 0.03928) {
            c = c / 12.92;
        } else {
            c = Math.pow((c + 0.055) / 1.055, 2.4);
        }
        return c;
    }

}
