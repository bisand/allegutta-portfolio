import { NordnetAccountInfo } from "./NordnetAccountInfo";
import { NordnetPosition } from "./NordnetPosition";

export class NordnetBatchData {
    public nordnetAccountInfo: NordnetAccountInfo;
    public nordnetPositions?: NordnetPosition[];
    public cacheUpdated?: Date;

    constructor(){
        this.nordnetAccountInfo = new NordnetAccountInfo();
        this.nordnetPositions = [];
    }
}