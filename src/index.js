const communityDrawer = document.getElementById("community-drawer");
let isCommunityDrawerUpdated = false;

if (communityDrawer) {
    console.log("Found community drawer");

    const config = { attributes: false, childList: true, subtree: true };

    const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            console.log(`Community drawer mutation: ${mutation.type}`);

            //InjectLayout-sc-1i43xsx-0 cXFDOs tw-image tw-image-avatar
            //Layout-sc-1xcs6mc-0 hJAUID viewer-card-mod-logs
            if (mutation.addedNodes?.length > 0 &&
                mutation.addedNodes[0].classList?.contains("user-details")) {
                if (isCommunityDrawerUpdated)
                    return;

                setTimeout(() => {
                    const cardEl = document.getElementsByClassName("viewer-card-header__display-name")[0];
                    if (cardEl) {
                        console.log(`Community drawer mutation, found card`);

                        const username = cardEl.getElementsByClassName("tw-link")[0]?.innerText;

                        username && appendLink(cardEl, username);
                        isCommunityDrawerUpdated = true;
                    }
                }, 500);

            }
            else if (mutation.removedNodes?.length > 0 &&
                mutation.removedNodes[0].classList?.contains("user-details")) {
                isCommunityDrawerUpdated = false;
            }
        }
    };

    new MutationObserver(callback).observe(communityDrawer, config);
}

//Appends link-icons to nicknames in the chat
const chat = document.getElementsByClassName("chat-scrollable-area__message-container")[0];
if (chat) {
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

//Appends a link with a given username to the provided element
function appendLink(usernameCardElement, username) {
    if (usernameCardElement?.innerHTML) {
        const a = getLinkElement(username, "artemiano.top");

        usernameCardElement.appendChild(a);
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