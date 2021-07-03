import { Conference } from '../entity/Conference';

export class YearsConferenceDto {
    id: string;
    name: string;
    presentations: number;

    constructor(c: Conference) {
      this.id = c.id;
      this.name = c.name;
      this.presentations = c.presentations.length;
    }
}
