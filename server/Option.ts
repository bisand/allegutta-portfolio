export class Option {

    private _timeout: number = 60;
    private _timeoutMsg: string = '';
    public get timeoutMsg(): string {
        return this._timeoutMsg;
    }
    public set timeoutMsg(value: string) {
        this._timeoutMsg = value;
    }
    public get timeout(): number {
        return this._timeout;
    }
    public set timeout(v: number) {
        this._timeout = v;
    }
    private _interval: number = 60;
    public get interval(): number {
        return this._interval;
    }
    public set interval(v: number) {
        this._interval = v;
    }
    constructor() {
    }
}
