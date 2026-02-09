const _leetify_key = window._leetify_key;
const _faceitApi = window._faceitApi;


const leetifyUrl = "https://api-public.cs-prod.leetify.com/v3/profile";
const faceitUrl = "https://open.faceit.com/data/v4/players"

var nameArray = []
var steam64Array = []


async function validateKey() {
    try {
        const validate = await fetch("https://api-public.cs-prod.leetify.com/api-key/validate", {
            method: "GET",
            headers: 
            {
                _leetify_key: _leetify_key,
            }
        })
        console.log(validate);
    } catch(error) {
        console.error(error.message);
        return null;
    }
}

const interval = setInterval(async () => {
    const roster = document.querySelectorAll('[class*="Nickname__Name"]');
    
    if (roster.length === 0) return;

    clearInterval(interval);
    const playerEntries = [];
    for (const div of roster) {
        const name = div.textContent.trim();
        nameArray.push(name);
        console.log(name);
        
        const steam64 = await getSteamID(name);

        if(steam64) {
            //console.log(steam64)
            steam64Array.push(steam64); 

            const container = div.closest('[class*="RosterParty__"]');

            playerEntries.push({
                container,
                steam64
            });
        }
    }
    
    await main(playerEntries);
}, 1000); 


async function getSteamID(name) {
    try {
        const response = await fetch(
            `${faceitUrl}?nickname=${encodeURIComponent(name)}`,
            {
                headers: {
                    Authorization: `Bearer ${_faceitApi}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`FACEIT response: ${response.status}`);
        }

        const result = await response.json();
        return result?.games?.cs2?.game_player_id
            ?? result?.games?.csgo?.game_player_id
            ?? null;


    } catch (error) {
        console.error("FACEIT:", error.message);
        return null;
    }
}


async function main(playerEntries) {

    validateKey();

    for (const entry of playerEntries) {

        if (!entry.steam64 || !entry.container) continue;
        console.log(entry.steam64);
        const result = await getData(entry.steam64);
        if (!result) continue;
        console.log(result.rating);
        const ratingDiv = document.createElement("div");
        ratingDiv.className = "leetify-rating";

        ratingDiv.textContent =
            `Leetify: ${result.ranks.leetify.toFixed(1)} | Aim: ${result.rating.aim.toFixed(1)} | Pos: ${result.rating.positioning.toFixed(1)} | Util: ${result.rating.utility.toFixed(1)}`;

        entry.container.appendChild(ratingDiv);

        await sleep(1800);
    }
    
}



async function getData(steam64)
{
    try {
        const response = await fetch(
            `${leetifyUrl}?steam64_id=${encodeURIComponent(steam64)}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${_leetify_key}`
                }
            }
        );

        if(!response.ok)
        {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        return result;

    } catch(error) {
        console.error(error.message);
        return null;
    }
        
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}


