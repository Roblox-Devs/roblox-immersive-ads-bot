const axios = require('axios');
const readline = require("readline")
const fs = require("fs");
const inquirer = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

let token;
let cookie = ""
let placeId;

async function getCSRFToken() {
    return new Promise((resolve, reject) => {
    axios.request({
        url: "https://auth.roblox.com/v2/logout",
        method: "post",
        headers: {
            Cookie: ".ROBLOSECURITY="+cookie
        }
    }).catch(function(error) {
        resolve(error.response.headers["x-csrf-token"])
    })})
}
function getAdInfo(ad) {
    for (var key in ad) {
        if (ad.hasOwnProperty(key) && typeof ad[key] == "object" && ad[key] !== null) {
            console.log(JSON.parse(JSON.stringify(ad[key])))
        }
    }
}
function main() {
    setInterval(async function() {
        token = await getCSRFToken()
        axios.request({
            url: "https://apis.roblox.com/ads/v1/serve-ads",
            method: "post",
            headers: {
                Cookie: ".ROBLOSECURITY="+cookie,
                "X-CSRF-TOKEN": token,
                "Roblox-Place-Id": placeId,
                "User-Agent": "Roblox/WinInetRobloxApp/0.552.0.5520592 (GlobalDist; RobloxDirectDownload)"
            },
            data: JSON.parse(fs.readFileSync('config/config.json', 'utf8'))
        }).then(function(response) {
	    console.log(response.data)
            if (Object.keys(response.data.adFulfillments).length > 0) {
                getAdInfo(response.data.adFulfillments)
            }
        }).catch(function(err) {
            console.log(err)
        })
    }, 7000)    
}
inquirer.question("Input your cookie: ", (coo) => {
    cookie = coo
    inquirer.question("PlaceID of game that will get requested with: ", (id) => {
        placeId = id
        main()
    })
})
