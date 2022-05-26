var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var puppeteer = require('puppeteer');

if (argv['h'] || argv['help'] || argv['?']) {
    console.log('[T100-Scraper] Usage: node index.js [--server <euw/eune/na/etc>]');
    process.exit();
}

if (!argv['server']) {
    console.log('[T100-Scraper] Missing arguments.');
    console.log('[T100-Scraper] Usage: node index.js [--server <euw/eune/na/etc>] ');
    process.exit();
}

var server = argv['server'];

var scrapeSummoners = async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--mute-audio', '--no-zygote', '--disable-gpu', '--disable-dev-shm-usage']
    });
        let leaderboardURL = 'https://' + server + '.op.gg/leaderboards/tier?region=' + server + '&page=1'
        var toReplace = 'https://' + server + '.op.gg/summoners/' + server + '/';
        const page = await browser.newPage();
        await page.goto(leaderboardURL);
        const urls = await page.evaluate((toReplace) => {
            const anchors = document.querySelectorAll('a');
            const urls = [];
            anchors.forEach(anchor => {
                if (anchor.href.includes('/summoners/')) {
                    urls.push(decodeURI(anchor.href.replace(toReplace, '')));
                }
            });
            return urls;
        }, toReplace);
        await browser.close();
        return urls;
}

var start = async function() {
    var summoners = await scrapeSummoners();
    fs.writeFile('output-' + server + '.txt', summoners.join(', '), function(err) {
        if (err) {
            return console.log(err);
        }
        console.log("[T100-Scraper] Summoner list saved to file.");
    });
}

start();

