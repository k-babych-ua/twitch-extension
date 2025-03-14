let isCommunityDrawerUpdated = false;

let localData = {};

const loadChat = () => {
    //Appends link-icons to nicknames in the chat
    const chat = document.getElementsByClassName("chat-scrollable-area__message-container")[0];

    //Wait for community drawer to be loaded
    if (!chat) {
        setTimeout(loadChat, 1000);
        return;
    }

    log("Found chat");
    const config = { attributes: false, childList: true, subtree: false };

    const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.addedNodes?.length > 0) {
                appendLinkImage(mutation.addedNodes[0]);
            }
        }
    };

    new MutationObserver(callback).observe(chat, config);

    //Append links to existing lines in the chat
    for (let chatline of chat.children) {
        appendLinkImage(chatline);
    }
}

const loadCommunityDrawer = () => {
    const communityDrawer = document.getElementById("community-drawer");

    //Wait for community drawer to be loaded
    if (!communityDrawer) {
        setTimeout(loadCommunityDrawer, 1000);
        return;
    }

    log("Found community drawer");

    const config = { attributes: false, childList: true, subtree: true };

    const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            //InjectLayout-sc-1i43xsx-0 cXFDOs tw-image tw-image-avatar
            //Layout-sc-1xcs6mc-0 hJAUID viewer-card-mod-logs
            const userDetails = mutation.addedNodes[0];
            if (userDetails && userDetails.classList?.contains("user-details")) {
                log("Found user-details");
                
                if (isCommunityDrawerUpdated)
                    return;

                processUserDetails(userDetails, 250);

            }
            else if (mutation.removedNodes?.length > 0 &&
                mutation.removedNodes[0].classList?.contains("user-details")) {
                isCommunityDrawerUpdated = false;
            }
        }
    };

    new MutationObserver(callback).observe(communityDrawer, config);
}

function processUserDetails(userDetails, timeout = 500){
    setTimeout(async () => {
        const cardEl = userDetails.getElementsByClassName("viewer-card-header__display-name")[0];
        if (cardEl) {
            const username = cardEl.getElementsByClassName("tw-link")[0]?.innerText;

            if (username) {
                username && appendLink(cardEl, username);

                const div = document.createElement("div");
                div.textContent = "Loading...";
                cardEl.appendChild(div);

                try {
                    username && await appendUserOverview(cardEl, username);

                    isCommunityDrawerUpdated = true;
                }
                catch (error) {
                    log(`Error happend trying to append user overview: ${error?.Message || error?.message || error}`);
                }
                finally {
                    div.remove();
                }
            }
            else {
                log("missing username, retrying");
                processUserDetails(userDetails, timeout * 2);
            }
        }
    }, timeout);
}

//Appends a link with a given username to the provided element
function appendLink(usernameCardElement, username) {
    if (usernameCardElement?.innerHTML) {
        const a = getLinkElement(username, "artemiano.top");

        usernameCardElement.appendChild(a);
    }
}

async function appendUserOverview(usernameCardElement, username) {
    if (usernameCardElement?.innerHTML) {
        const overview = await getOrFetchUserOverview(username);

        const tagsDiv = document.createElement("div");
        tagsDiv.textContent = `Tags: ${overview.tagsAnalytics?.totalTags} (${overview.tagsAnalytics?.greenTags} good; ${overview.tagsAnalytics?.redTags} bad)`;

        usernameCardElement.appendChild(tagsDiv);

        const followsTag = document.createElement("div");
        followsTag.textContent = `Follows: ${overview.followingAnalytics?.totalFollowings} (${overview.followingAnalytics.greenFollowings} good; ${overview.followingAnalytics.redFollowings} bad; ${overview.followingAnalytics.mixed} mixed)`;

        usernameCardElement.appendChild(followsTag);
    }
}

//Appends a link image to the username in chat
function appendLinkImage(chatLineElement) {
    const userName = chatLineElement.getElementsByClassName("chat-line__username")[0];
    const usernNameContainer = chatLineElement.getElementsByClassName("chat-line__username-container")[0];

    if (userName && usernNameContainer) {
        const img = document.createElement("img");

        img.setAttribute("src", "https://artemiano.top/favicon/favicon.ico");
        img.setAttribute("width", 18);
        img.setAttribute("height", 18);

        const a = getLinkElement(userName.innerText);
        a.appendChild(img);

        usernNameContainer.appendChild(a);
    }
}

function getLinkElement(username, innerText) {
    const a = document.createElement("a");
    a.setAttribute("href", `https://artemiano.top/twitch/${username}`);
    a.setAttribute("target", "_blank");

    if (innerText) {
        a.innerHTML = "artemiano.top";
    }

    return a;
};

async function getOrFetchUserOverview(username) {
    if (!localData[username]) {
        localData[username] = await fetchUserOverview(username);
    }

    return localData[username];
}

async function fetchUserOverview(username) {
    const url = `https://twitch-followers-api.azurewebsites.net/api/overview/${username}`;
    
    try {
        const response = await fetch(url);

        if (response.ok) {
            return response.json();
        }
    }
    catch (error) {
        log(error.Message || error.message || error);
    }
}

if (document.readyState === "complete") {
    loadCommunityDrawer();
    loadChat();
}
else {
    document.onreadystatechange = () => {
        if (document.readyState !== "complete")
            return;
        
        loadCommunityDrawer();
        loadChat();
    };
}

log("Loaded");

function log(message) {
    console.log(`Twitch Moderator Extention: ${message}`);
}