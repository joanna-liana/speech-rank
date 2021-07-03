import { Conference } from '../entity/Conference';
import { PresentationDto } from './PresentationDto';

export class ConferenceDto {
    id: string;
    name: string;
    presentations: PresentationDto[];

    constructor(conference: Conference) {
      this.id = conference.id;
      this.name = conference.name;
      this.presentations = conference.presentations.map(p => new PresentationDto(p));
    }
}
