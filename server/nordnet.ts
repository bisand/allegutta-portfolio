import puppeteer from 'puppeteer';
import { Option } from './Option';
import { NordnetPosition } from "./models/NordnetPosition";
import { NordnetBatchData as NordnetBatchData } from './models/NordnetBatchData';

export class NordnetApi {

    private static nordnetBatchData: NordnetBatchData = new NordnetBatchData();

    private _self: NordnetApi;
    private _username: string;
    private _password: string;
    private _intervalPointer: NodeJS.Timeout | undefined;

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

    private once(checkFn: any, opts = new Option()) {
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
        clearInterval(this._intervalPointer as NodeJS.Timeout);
        await this.updateCache(this);
        this._intervalPointer = setInterval(this.updateCache, pollIntervalMinutes * 60 * 1000, this);
    }

    public async stopPolling() {
        clearInterval(this._intervalPointer as NodeJS.Timeout);
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
                // await page.click("//button/*[contains(., 'brukernavn og passord')]")
                await page.waitForXPath("//button[contains(., 'innloggingsmetode')]", { timeout: 10000 })
                const [button1] = await page.$x("//button[contains(., 'innloggingsmetode')]");
                if (button1) {
                    await button1.click();
                }
                await page.waitForXPath("//button[contains(., 'brukernavn og passord')]", { timeout: 10000 })
                const [button2] = await page.$x("//button[contains(., 'brukernavn og passord')]");
                if (button2) {
                    await button2.click();
                }


                await page.waitForSelector('input[name="username"]', { timeout: 10000 });
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
                    const isAPI = url && (url.includes('/api/2/batch') || url.includes('/api/2/accounts'))
                    const isPOST = request.method() === 'POST'
                    const isJson = headers['content-type'] && headers['content-type'].includes('application/json');

                    if (isAPI && isPOST && isJson) {
                        try {
                            const postData = JSON.parse(JSON.parse(postDataText as string)['batch']);
                            if (postData)
                                for (let i = 0; i < postData.length; i++) {
                                    const item = postData[i];
                                    if (item.relative_url.includes('accounts/2/positions')) {
                                        const json = await response.json();
                                        if (Array.isArray(json) && json.length > 0 && json[i]['body'] && Array.isArray(json[i]['body'])) {
                                            dataCollected = await collectPositions(response, json[i]['body'], dataCollected);
                                        }
                                    } else if (item.relative_url.includes('accounts/2/info')) {
                                        const json = await response.json();
                                        if (Array.isArray(json) && json.length > 0 && json[i]['body'] && Array.isArray(json[i]['body']) && json[i]['body'].length > 0) {
                                            dataCollected = await collectAccountInfo(response, json[i]['body'][0], dataCollected);
                                        }
                                    }
                                }
                        } catch (error) {
                            console.error(error);
                        }
                    }
                    else if (isAPI && isJson) {
                        try {
                            if (url.includes('accounts/2/positions')) {
                                const json = await response.json();
                                if (Array.isArray(json) && json.length > 0) {
                                    dataCollected = await collectPositions(response, json, dataCollected);
                                }
                            } else if (url.includes('accounts/2/info')) {
                                const json = await response.json();
                                if (Array.isArray(json) && json.length > 0) {
                                    dataCollected = await collectAccountInfo(response, json[0], dataCollected);
                                }
                            }

                        } catch (error) {
                            console.error(error);
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

        async function collectAccountInfo(response: puppeteer.HTTPResponse, json: any, dataCollected: number) {
            NordnetApi.nordnetBatchData.nordnetAccountInfo = json;
            NordnetApi.nordnetBatchData.cacheUpdated = new Date();
            dataCollected++;
            return dataCollected;
        }

        async function collectPositions(response: puppeteer.HTTPResponse, json: any, dataCollected: number) {
            NordnetApi.nordnetBatchData.nordnetPositions = json;
            NordnetApi.nordnetBatchData.cacheUpdated = new Date();
            dataCollected++;
            return dataCollected;
        }
    }
};
