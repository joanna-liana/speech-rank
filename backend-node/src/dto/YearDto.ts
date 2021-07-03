import { Year } from '../entity/Year';
import { YearsConferenceDto } from './YearsConferenceDto';

export class YearDto {
    year: string;
    conferences: YearsConferenceDto[];

    constructor(y: Year) {
      this.year = y.year;
      this.conferences = y.conferences.map(c => new YearsConferenceDto(c));
    }
}
