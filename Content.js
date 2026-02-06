const _leeify_key = window._leeify_key;
const _faceitApi = window._faceitApi;


const leetifyUrl = "https://api-public.cs-prod.leetify.com/v3/profile";
const faceitUrl = "https://open.faceit.com/data/v4/players"

var nameArray = []
var steam64Array = []


const interval = setInterval(async () => {
    const roster = document.querySelectorAll('[class*="Nickname__Name"]');
    
    if (roster.length === 0) return;

    clearInterval(interval);

    for (const div of roster) {
        const name = div.textContent.trim().replace(/\s+/g, "");
        nameArray.push(name);
        
        const steam64 = await getSteamID(name);

        if(steam64) {
            console.log(steam64)
            steam64Array.push(steam64); 
        }
    }
    
    await main();
}, 500); 


async function getSteamID(name) {
    try {
        if (!_faceitApi) throw new Error("FACEIT API key is missing!");

        const response = await fetch(
            `${faceitUrl}?nickname=${encodeURIComponent(name)}&game=csgo`,
            {
                headers: {
                    Authorization: `Bearer ${_faceitApi}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();

        // steam_id_64 is a top-level field in the response
        const steamId64 = result.steam_id_64;

        return steamId64;

    } catch (error) {
        console.error(error.message);
        return null;
    }
}

async function main() {
    for(const steam64 of steam64Array) {
        const rating = await getData(steam64);
        console.log(rating)
    }
}

async function getData(steam64)
{
    try {
        const response = await fetch(
            `${leetifyUrl}?steam64_id=${encodeURIComponent(steam64)}`,
            {
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
        return result.rating;

    } catch(error) {
        console.error(error.message);
        return null;
    }
        
}

