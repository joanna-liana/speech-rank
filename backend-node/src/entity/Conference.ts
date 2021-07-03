import { Presentation } from './Presentation';

export interface Conference {
    id: string;
    name: string;
    presentations: Presentation[];
}
