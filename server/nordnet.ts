import puppeteer from 'puppeteer';
import { Option } from './Option';
import { NordnetPosition } from "./models/NordnetPosition";
import { NordnetBatchData as NordnetBatchData } from './models/NordnetBatchData';

export class NordnetApi {

    private static nordnetBatchData: NordnetBatchData = new NordnetBatchData();

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
        this._username = username;
        this._password = password;
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

    public async startPolling(pollIntervalMinutes: number = 60) {
        clearInterval(this._intervalPointer);
        this._intervalPointer = setInterval(async () => {
            if (!this.onBatchDataReceived)
                return;
            try {
                const data: NordnetBatchData = await this.getBatchData(true);
                this.onBatchDataReceived(data);
            } catch (err) {
                if (this.onError)
                    this.onError(err);
            }
        }, pollIntervalMinutes * 60 * 1000);
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

                await page.type('input[name="username"]', this._username)
                await page.type('input[name="password"]', this._password)

                await Promise.all([
                    page.click('button[type="submit"]'),
                    page.waitForNavigation(),
                ]);

                let dataCollected: number = 0;
                page.on('response', async response => {
                    const isAPI = response.url().includes('/api/2/batch')
                    const isPOST = response.request().method() === 'POST'
                    const isJson = response.headers()['content-type'].includes('application/json');

                    if (isAPI && isPOST && isJson) {
                        const postData = JSON.parse(JSON.parse(response.request().postData())['batch']);
                        const json = await response.json().catch(err => {
                            console.error(err);
                            reject(err);
                        });
                        for (let i = 0; i < postData.length; i++) {
                            const item = postData[i];
                            if (item.relative_url.includes('accounts/2/positions')) {
                                if (Array.isArray(json) && json.length > 0 && json[i]['body'] && Array.isArray(json[i]['body'])) {
                                    dataCollected++;
                                    NordnetApi.nordnetBatchData.nordnetPositions = json[i]['body'];
                                    NordnetApi.nordnetBatchData.cacheUpdated = new Date();
                                }
                            }
                            if (item.relative_url.includes('accounts/2/info')) {
                                if (Array.isArray(json) && json.length > 0 && json[i]['body'] && Array.isArray(json[i]['body']) && json[i]['body'].length > 0) {
                                    dataCollected++;
                                    NordnetApi.nordnetBatchData.nordnetAccountInfo = json[i]['body'][0];
                                    NordnetApi.nordnetBatchData.cacheUpdated = new Date();
                                }
                            }
                        }
                    }
                });

                await Promise.all([
                    page.goto('https://www.nordnet.no/overview/details/2', { waitUntil: 'networkidle0' }),
                    this.once(() => dataCollected < 1)
                ]).catch(reason => {
                    console.error(reason);
                    reject(reason);
                });
                resolve(NordnetApi.nordnetBatchData);

                await browser.close();

            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }
};
