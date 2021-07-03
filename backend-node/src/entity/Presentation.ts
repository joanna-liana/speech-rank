import { v4 } from 'uuid';

import { VideoData } from '../gateway/Importer';
import { Comment } from './Comment';
import { Rate } from './Rate';

export class Presentation {
    #id = v4();
    #rating= 0.0;
    #rates: Rate[] = [];
    #comments: Comment[] = [];
    #title: string;
    #link: string;

    get id(): string {
      return this.#id;
    }

    get rating(): number {
      return this.#rating;
    }

    get rates(): Rate[] {
      return this.#rates;
    }

    get comments(): Comment[] {
      return this.#comments;
    }

    get title(): string {
      return this.#title;
    }

    get link(): string {
      return this.#link;
    }

    constructor(videoData: VideoData) {
      this.#title = videoData.title;
      this.#link = 'https://youtube.com/embed/' + videoData.videoId;
    }


    addRate(rate: Rate): number {
      this.#rates = this.#rates.concat(rate);
      this.#rating = this.#rates.reduce((prev, curr) => prev + curr.rate, 0) / this.#rates.length;

      return this.#rating;
    }

    addComment(comment: Comment): Comment {
      this.#comments = this.#comments.concat(comment);
      return comment;
    }
}
