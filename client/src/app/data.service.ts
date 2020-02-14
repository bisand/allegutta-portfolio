import { Injectable } from '@angular/core';
import { IPosition } from "./home/IPosition";

@Injectable({
    providedIn: 'root',
})
export class DataService {
    public position: IPosition;
    constructor() {
        this.position = {} as IPosition;
    }
}
