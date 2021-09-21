import puppeteer from 'puppeteer';
import { Option } from './Option';
import { NordnetPosition } from "./models/NordnetPosition";
import { NordnetBatchData as NordnetBatchData } from './models/NordnetBatchData';

export class NordnetApi {

    private static nordnetBatchData: NordnetBatchData = new NordnetBatchData();

    private _self: NordnetApi;
    private _username: string;
    private _password: string;
    private _intervalPointer: NodeJS.Timeout;

    public onBatchDataReceived?: (batchData: NordnetBatchData) => void;
    public onError?: (error: any) => void;

    public get username(): string {
        return this._username;
    }
    public set username(value: string) {
        this._username = value;
    }
    public get password(): string {
        return this._password;
    }
    public set password(value: string) {
        this._password = value;
    }

    constructor(username: string, password: string) {
        if (!username || !password)
            throw new Error("Username and password must be filled! Use environment variables NORDNET_USERNAME and NORDNET_PASSWORD");

        this._username = username;
        this._password = password;
        this._self = this;
    }

    private once(checkFn, opts = new Option()) {
        return new Promise((resolve, reject) => {
            const startTime = new Date();
            const timeout = opts.timeout || 10000;
            const interval = opts.interval || 100;
            const timeoutMsg = opts.timeoutMsg || "Timeout!";

            const poll = function () {
                const ready = checkFn();
                if (ready) {
                    resolve(ready);
                } else if (((new Date()).valueOf() - startTime.valueOf()) > timeout) {
                    reject(new Error(timeoutMsg));
                } else {
                    setTimeout(poll, interval);
                }
            }

            poll();
        })
    }

    private async updateCache(self: NordnetApi) {
        if (!self.onBatchDataReceived)
            return;
        try {
            const data: NordnetBatchData = await self.getBatchData(true);
            self.onBatchDataReceived(data);
        } catch (err) {
            if (self.onError)
                self.onError(err);
        }
    }

    public async startPolling(pollIntervalMinutes: number = 60) {
        clearInterval(this._intervalPointer);
        await this.updateCache(this);
        this._intervalPointer = setInterval(this.updateCache, pollIntervalMinutes * 60 * 1000, this);
    }

    public async stopPolling() {
        clearInterval(this._intervalPointer);
    }

    public async getBatchData(forceRun: boolean = false, refreshIntervalMinutes: number = 60): Promise<NordnetBatchData> {
        const timeout: number = refreshIntervalMinutes * 60 * 1000;
        return new Promise(async (resolve, reject) => {
            if (!forceRun && NordnetApi.nordnetBatchData.cacheUpdated && (((new Date()).valueOf() - NordnetApi.nordnetBatchData.cacheUpdated.valueOf()) < timeout)) {
                resolve(NordnetApi.nordnetBatchData);
                return;
            }
            try {
                const URL = 'https://www.nordnet.no/login-next'
                const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1024, height: 768 }, args: ['--disable-dev-shm-usage'] })
                const page = await browser.newPage()

                await page.goto(URL)
                await page.click('button#cookie-accept-all-secondary');
                await page.click('button#otp-view')

                await page.waitForSelector('input[name="username"]', { timeout: 5000 });
                await page.type('input[name="username"]', this._username)
                await page.type('input[name="password"]', this._password)

                await Promise.all([
                    page.click('button[type="submit"]'),
                    page.waitForNavigation(),
                ]);

                let dataCollected: number = 0;
                page.on('response', async response => {
                    if (!response.ok())
                        return;

                    const request = response.request();
                    const headers = response.headers();

                    const url = request.url();
                    const postDataText = request.postData();
                    const isAPI = url && url.includes('/api/2/batch')
                    const isPOST = request.method() === 'POST'
                    const isJson = headers['content-type'] && headers['content-type'].includes('application/json');

                    if (isAPI && isPOST && isJson) {
                        const postData = JSON.parse(JSON.parse(postDataText)['batch']);
                        for (let i = 0; i < postData.length; i++) {
                            const item = postData[i];
                            if (item.relative_url.includes('accounts/2/positions')) {
                                const json = await response.json();
                                if (Array.isArray(json) && json.length > 0 && json[i]['body'] && Array.isArray(json[i]['body'])) {
                                    NordnetApi.nordnetBatchData.nordnetPositions = json[i]['body'];
                                    NordnetApi.nordnetBatchData.cacheUpdated = new Date();
                                    dataCollected++;
                                }
                            } else if (item.relative_url.includes('accounts/2/info')) {
                                const json = await response.json();
                                if (Array.isArray(json) && json.length > 0 && json[i]['body'] && Array.isArray(json[i]['body']) && json[i]['body'].length > 0) {
                                    NordnetApi.nordnetBatchData.nordnetAccountInfo = json[i]['body'][0];
                                    NordnetApi.nordnetBatchData.cacheUpdated = new Date();
                                    dataCollected++;
                                }
                            }
                        }
                    }
                });

                await Promise.all([
                    page.goto('https://www.nordnet.no/overview/details/2', { waitUntil: 'networkidle0' }),
                    this.once(() => dataCollected < 2)
                ]).catch(reason => {
                    reject(reason);
                });
                resolve(NordnetApi.nordnetBatchData);

                await browser.close();

            } catch (error) {
                reject(error);
            }
        });
    }
};
