const container = document.getElementById('container');
const zoneViewer = document.getElementById('zoneViewer');
let zoneFrame = document.getElementById('zoneFrame');
const searchBar = document.getElementById('searchBar');
const sortOptions = document.getElementById('sortOptions');

const REPO_OWNER = "MonkeyGG2";
const REPO_NAME = "monkeygg2.github.io";
const BRANCH = "main";

const htmlURL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/games`;
const coverURL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/games`;

let zones = [];
let popularityData = {};

async function listZones() {
    try {
        // === AUTOMATICALLY LOAD GAMES FROM config.jsonc ===
        const configResponse = await fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/config.jsonc?t=${Date.now()}`);
        let configText = await configResponse.text();
        
        // Remove JSONC comments (// and /* */)
        configText = configText.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
        
        const config = JSON.parse(configText);
        const gamesList = config.games || [];

        zones = gamesList.map((game, index) => {
            const folder = game.path;
            let gameUrl = "";

            if (folder.startsWith("flash/?game=")) {
                // Flash games use the flash player wrapper
                gameUrl = `{HTML_URL}/flash/index.html?game=${folder.split('=')[1]}`;
            } else {
                // Normal HTML5 games
                gameUrl = `{HTML_URL}/${folder}/index.html`;
            }

            return {
                id: index + 1,
                name: game.name || folder.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                url: gameUrl,
                cover: `{COVER_URL}/${folder}/thumbnail.png`,   // most common cover name
                author: "MonkeyGG2",
                featured: index < 6   // first 6 as featured (you can change this)
            };
        });

        // Fallback cover if thumbnail.png doesn't exist (optional improvement)
        // You can add more fallbacks later: cover.png, screenshot.jpg, etc.

        await fetchPopularity();
        sortZones();

        // Handle direct link ?id= or #embed
        const search = new URLSearchParams(window.location.search);
        const id = search.get('id');
        const embed = window.location.hash.includes("embed");

        if (id) {
            const zone = zones.find(zone => zone.id + '' == id + '');
            if (zone) {
                if (embed) {
                    const url = zone.url.replace("{COVER_URL}", coverURL).replace("{HTML_URL}", htmlURL);
                    fetch(url + "?t=" + Date.now())
                        .then(r => r.text())
                        .then(html => {
                            document.documentElement.innerHTML = html;
                            // Your existing embed popup code here if you want
                        });
                } else {
                    openZone(zone);
                }
            }
        }
    } catch (error) {
        console.error("Failed to load games:", error);
        container.innerHTML = `Error loading games from MonkeyGG2 repo.<br><br>${error}`;
    }
}

// Keep ALL your other functions exactly as they were:
async function fetchPopularity() { /* your original code */ }
function sortZones() { /* your original code */ }
function displayFeaturedZones(featuredZones) { /* your original code */ }
function displayZones(zones) { /* your original code */ }
function filterZones() { /* your original code */ }

function openZone(file) {
    const finalUrl = file.url.replace("{COVER_URL}", coverURL).replace("{HTML_URL}", htmlURL);
    
    if (file.url.startsWith("http")) {
        window.open(file.url, "_blank");
    } else {
        fetch(finalUrl + "?t=" + Date.now())
            .then(response => response.text())
            .then(html => {
                if (!zoneFrame || zoneFrame.contentDocument === null) {
                    zoneFrame = document.createElement("iframe");
                    zoneFrame.id = "zoneFrame";
                    zoneViewer.appendChild(zoneFrame);
                }
                zoneFrame.contentDocument.open();
                zoneFrame.contentDocument.write(html);
                zoneFrame.contentDocument.close();

                document.getElementById('zoneName').textContent = file.name;
                document.getElementById('zoneId').textContent = file.id;
                document.getElementById('zoneAuthor').textContent = "by " + file.author;

                zoneViewer.style.display = "block";
                const url = new URL(window.location);
                url.searchParams.set('id', file.id);
                history.pushState(null, '', url.toString());
                zoneViewer.hidden = true;
            })
            .catch(err => alert("Failed to load game: " + err));
    }
}

// Paste all your remaining functions here unchanged:
// aboutBlank, closeZone, downloadZone, fullscreenZone, saveData, loadData, darkMode, cloakIcon, cloakName, tabCloak, settings, showContact, loadPrivacy, loadDMCA, closePopup, etc.
// (including the school blocking fetch/XHR overrides at the bottom)

listZones();
