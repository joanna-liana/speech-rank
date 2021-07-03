import { Comment } from '../entity/Comment';
import { Presentation } from '../entity/Presentation';
import { Rate } from '../entity/Rate';

export class PresentationDto {
    id: string;
    title: string;
    link: string;
    rating: number;
    rates: Rate[];
    comments: Comment[];

    constructor(p: Presentation) {
      this.id = p.id;
      this.title = p.title;
      this.link = p.link;
      this.rating = p.rating;
      this.rates = p.rates;
      this.comments = p.comments;
    }
}
