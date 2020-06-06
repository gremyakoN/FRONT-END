import {Moment} from 'moment';
import {MatMomentDateAdapterOptions, MomentDateAdapter} from '@angular/material-moment-adapter';
import {Injectable} from '@angular/core';

@Injectable()
export class RuDateAdapter extends MomentDateAdapter {

    constructor(dateLocale: string, options?: MatMomentDateAdapterOptions) {
        super(dateLocale, options);
    }

    format(date: Moment, displayFormat: any): string {
        return date.format('DD.MM.YYYY');
    }
}

