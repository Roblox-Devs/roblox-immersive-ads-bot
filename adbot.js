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
let json = JSON.parse(fs.readFileSync('config/config.json', 'utf8'))

async function getCSRFToken() {
    return new Promise((resolve, reject) => {
        axios.request({
            url: "https://auth.roblox.com/v2/logout",
            method: "post",
            headers: {
                Cookie: ".ROBLOSECURITY=" + cookie
            }
        }).catch(function (error) {
            resolve(error.response.headers["x-csrf-token"])
        })
    })
}
async function getUniverseId(placeid) {
    return axios.get("https://apis.roblox.com/universes/v1/places/" + placeid + "/universe", {}).then(async function (response) {
        return response.data.universeId
    })
}
function getAdInfo(ad) {
    for (var key in ad) {
        if (ad.hasOwnProperty(key) && typeof ad[key] == "object" && ad[key] !== null) {
            const info = JSON.parse(JSON.stringify(ad[key]));
            let imgId = 0;
            let name = "";
            let destinationPlaceId = "";
            if (info.portalAdCreativeData == null || info.portalAdCreativeData.topBanner == null || info.portalAdCreativeData.topBanner.assetId == null) { imgId = "None" } else { imgId = info.portalAdCreativeData.topBanner.assetId }
            if (info.portalAdCreativeData == null || info.portalAdCreativeData.adText == null) { name = "None" } else { name = info.portalAdCreativeData.adText }
            if (info.portalAdCreativeData == null || info.portalAdCreativeData.destinationPlaceId == null) { destinationPlaceId = "None" } else { destinationPlaceId = info.portalAdCreativeData.destinationPlaceId }
            console.log(`Got AD (imageassetid: ${imgId}, name: ${name}): [PlaceID: ${destinationPlaceId}]`)
        }
    }
}

function main() {
    setInterval(async function () {
        token = await getCSRFToken()
        axios.request({
            url: "https://apis.roblox.com/ads/v1/serve-ads",
            method: "post",
            headers: {
                Cookie: ".ROBLOSECURITY=" + cookie,
                "X-CSRF-TOKEN": token,
                "Roblox-Place-Id": placeId,
                "User-Agent": "Roblox/WinInetRobloxApp/0.552.0.5520592 (GlobalDist; RobloxDirectDownload)"
            },
            data: json
        }).then(function (response) {
            if (Object.keys(response.data.adFulfillments).length > 0) {
                getAdInfo(response.data.adFulfillments)
            }
        }).catch(function (err) {
            console.log(err)
        })
    }, 4000)
}
inquirer.question("Input your cookie: ", async (coo) => {
    cookie = coo
    inquirer.question("PlaceID of game that will get requested with: ", async (id) => {
        placeId = id
        json.placeId = parseInt(id) //turn to number
        json.universeId = await getUniverseId(id)
        // Add the following line to update the JSON file
        main()
    })
})
