import axios, { AxiosInstance } from "axios-proxy-fix";
import * as fs from "fs";
import * as readline from "readline";
import * as logger from "winston";
import { getRandomInt } from "./Utils";

export interface IProxy {
  host: string;
  port: number;
}

export class ProxyHelpers {

  public static async initProxies(inputFile: string = "data/proxy.txt") {
    return new Promise((resolve, reject) => {
      this.proxies = [];
      const instream = fs.createReadStream(inputFile);
      const rl = readline.createInterface({
        input: instream,
        output: null,
      });

      rl.on("line", (line) => {
        const p = line.split(":");
        this.proxies.push({ host: p[0], port: parseInt(p[1], 10) });
      });

      rl.on("close", (line) => {
        logger.info(`Initialized ${this.proxies.length} proxies`);
        return resolve();
      });
    });
  }

  public static getValidProxyOnline(): Promise<IProxy> {
    return new Promise(async (resolve, reject) => {
      logger.info("Starting to search a valid proxy online ...");
      const NS_PER_SEC = 1e9;
      const time = process.hrtime();
      let myProxy: string;
      let pTest: IProxy;
      let test = false;
      do {
        try {
          myProxy = await this.getProxyOnline();
        } catch (err) {
          return reject(err.message);
        }
        const p = myProxy.split(":");
        pTest = {
          host: p[0],
          port: parseInt(p[1], 10),
        };
        logger.debug(`Testing: ${pTest.host}:${pTest.port}`, "...");
        test = await this.proxyTest(pTest);
        const CURSOR_UP_ONE = "\x1b[1A";
        const ERASE_LINE = "\x1b[2K";
        process.stdout.write(CURSOR_UP_ONE + ERASE_LINE);
        logger.debug(`Testing: ${pTest.host}:${pTest.port}`,  "...", `${test}`);
      } while (!test);

      const diff = process.hrtime(time);
      logger.info(`Proxy found in ${diff[0] * NS_PER_SEC + diff[1]} nanoseconds. (${pTest.host}:${pTest.port})`);
      return resolve(pTest);
    });
  }

  public static getValidProxy(): Promise<IProxy> {
    return new Promise(async (resolve, reject) => {
      logger.info("Starting to search a valid proxy ...");
      const NS_PER_SEC = 1e9;
      const time = process.hrtime();
      let proxy: IProxy;
      let test = false;
      do {
        proxy = await this.getProxy();
        logger.debug(`Testing: ${proxy.host}:${proxy.port} ... `);
        test = await this.proxyTest(proxy);
        const CURSOR_UP_ONE = "\x1b[1A";
        const ERASE_LINE = "\x1b[2K";
        process.stdout.write(CURSOR_UP_ONE + ERASE_LINE);
        logger.debug(`Testing: ${proxy.host}:${proxy.port} ... ${test}`);
      } while (!test);

      const diff = process.hrtime(time);
      logger.info(`Proxy found in ${diff[0] * NS_PER_SEC + diff[1]} nanoseconds. (${proxy.host}:${proxy.port})`);
      return resolve(proxy);
    });
  }

  private static proxies: IProxy[];

  private static proxyTest(proxy: IProxy, timeout: number = 6000): Promise<boolean> {
    return new Promise((resolve, reject) => {
      axios.get("https://www.dofus.com/fr", {
        proxy: {
          host: proxy.host,
          port: proxy.port,
        },
        timeout,
      })
        .then((response) => resolve(true))
        .catch((error) => resolve(false));
    });
  }

  private static getProxyOnline(): Promise<string> {
    return new Promise((resolve, reject) => {
      // axios.get("https://gimmeproxy.com/api/getProxy?protocol=http&supportsHttps=true&country=FR&get=true")
      //   .then((response) => {
      //     const proxy = `${response.data.ip}:${response.data.port}`;
      //     return resolve(proxy);
      //   })
      axios.get(
        "http://pubproxy.com/api/proxy?api=cDhCQVlKaGlTWXNlRXpLMmxYOHZDZz09&type=http")
        .then((response) => {
          return resolve(response.data.data[0].ipPort);
        })
        .catch((error) => reject(error));
    });
  }

  private static getProxy(): Promise<IProxy> {
    return new Promise((resolve, reject) => {
      const num = getRandomInt(0, this.proxies.length - 1);
      return resolve(this.proxies[num]);
    });
  }
}
