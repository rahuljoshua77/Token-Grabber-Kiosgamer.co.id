const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const UserAgent = require("user-agents");
const date = () => new Date().toLocaleTimeString();
const fs = require("fs");

var datas = fs.readFileSync('./akun.txt', 'utf8');
data = datas.split(/\r?\n/);

(async () => {
  process.setMaxListeners(0);
  for (let getData of data){
    try{    
        let dataFilter = getData.split("|")
    
        let email = dataFilter[0]
        let password = dataFilter[1]
        const userAgent = new UserAgent({
            deviceCategory: "mobile",
            platform: "Linux x86_64",
        });
        const browser = await puppeteer.launch({
            headless: true,
            devtools: true,
            args: [`--user-agent=${userAgent}`, `--window-size=350,700`],
        });
        const [page] = await browser.pages();
        var usrAgen = userAgent.toString().replace(/\r?\n|\r/, "");
        await page.setUserAgent(usrAgen);
        await page.setViewport({ width: 350, height: 700 });

        await page.goto(
            "https://thirdparty.aliexpress.com/login.htm?spm=a2g0n.login-h5.0.0.48824378dLLO84&type=gg&from=msite&return_url=https%3A%2F%2Ftrade.aliexpress.com%2ForderList.htm%3Fspm%3Da2g0o.home.1000001.31.650c21457wWf2q%26tracelog%3Dws_topbar%26tsp%3D1615907525265"
        );
        console.log(`(${date()}) (${email}) ==> Trying to Login`);
        try {
            await page.waitForSelector("input[type=email]", {
                visible: true,
                timeout: 30000,
            });
            await page.type("input[type=email]", email,{ delay: 100 });
            try {
                await page.click("#identifierNext > div > button > div.VfPpkd-RLmnJb");
            } catch (error) {
                await page.click("#next");
            }
            await page.waitForSelector("input[type=password]", {
                visible: true,
                timeout: 30000,
            });
            await page.type("input[type=password]", password,{ delay: 100 });
            try {
                await page.click("#passwordNext > div > button > div.VfPpkd-RLmnJb");
            } catch (error) {
                await page.click("#submit");
            }
            const [response] = await Promise.all([
                page.waitForResponse((response) => response.url().includes("tokenLogin")),
            ]);
            getUrl = response._url.split('tokenLogin.htm?')
            token_fix = 'https://login.aliexpress.com/tokenLogin.htm?'+getUrl[1]
            console.log(`(${date()}) (${email}) ==> ${token_fix}`);
            fs.appendFileSync('result.txt',`${email}|${password}|${token_fix}\n`)
            await browser.close();
        }
        catch(e){
            console.log(`(${date()}) (${email}) Failed Get Token: ${e}`)
            fs.appendFileSync('failed.txt',`${email}|${password}\n`)
            if (browser) {
                await browser.close();
            }
        }
    }
    catch(e){
        console.log(`(${date()}) (${email}) Failed Get Token: ${e}`)
        fs.appendFileSync('failed.txt',`${email}|${password}\n`)
        if (browser) {
            await browser.close();
        }
    }
  }
})();
