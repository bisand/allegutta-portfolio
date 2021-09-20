import puppeteer from 'puppeteer';
import { Option } from './Option';
import { NordnetPosition } from './models/NordnetPosition';
import { PortfolioPosition } from './models/position';

export class NordnetApi {
    private _username: string;
    private _password: string;

    public onPositionsReceived?: (positions: NordnetPosition[]) => void

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

    public async startPolling(pollIntervalMinutes: number) {
        setTimeout(async () => {
            if (!this.onPositionsReceived) return
            const positions: NordnetPosition[] = await this.getBatchData('accounts/2/positions');
            this.onPositionsReceived(positions)
        }, pollIntervalMinutes * 1000);
    }

    public async getBatchData(batchPath: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
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

                let dataCollected = false;
                page.on('response', async response => {
                    const isAPI = response.url().includes('/api/2/batch')
                    const isPOST = response.request().method() === 'POST'
                    const isJson = response.headers()['content-type'].includes('application/json');

                    if (isAPI && isPOST && isJson) {
                        const postData = JSON.parse(JSON.parse(response.request().postData())['batch']);
                        let posIdx = -1;
                        for (let i = 0; i < postData.length; i++) {
                            const item = postData[i];
                            if (item.relative_url.includes(batchPath)) {
                                posIdx = i;
                                const json = await response.json().catch(err => {
                                    console.error(err);
                                    reject(err);
                                });
                                if (Array.isArray(json) && json.length > 0 && json[posIdx]['body'] && Array.isArray(json[posIdx]['body'])) {
                                    dataCollected = true;
                                    let data: NordnetPosition[] = json[posIdx]['body'];
                                    resolve(data);
                                }
                            }
                        }
                    }
                });

                await Promise.all([
                    page.goto('https://www.nordnet.no/overview/details/2', { /*waitUntil: 'networkidle0' */ }),
                    this.once(() => dataCollected)
                ]).catch(reason => {
                    console.error(reason);
                    reject(reason);
                });

                await browser.close();

            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }
};
