/**
 * Hermiebox Driver
 *
 * TL;DR: SSB API for Patchfox using Hermiebox.
 *
 * OBJECTIVE:
 * The SSB is in flux right now. There are many approaches being played with which might
 * affect how this WebExtension connect to sbot. Some of the experiments being tried out are:
 *
 * - lessbot/nobot: each app maintain its own database and index but post through a shared sbot.
 * - graphql: export a GraphQL server which offers SSB features.
 * - json-rpc: export a JSON-RPC server offering SSB features.
 *
 * This driver folder will contain the various adapters to use these modes of connection as they
 * become available. For now, we'll use hermiebox.
 *
 * **Important: Each driver should export the exact same API to Patchfox**. This way we can
 * switch drivers without having to refactor the add-on.
 *
 * HOW IT WORKS:
 * Hermiebox is a browserified fat package of common NodeJS modules from our community and also
 * few highlevel API methods for common tasks. It uses WebSockets to connect to a running sbot
 * using muxrpc and shs stuff, so it needs your `secret` to be available.
 */

export class DriverHermiebox {
    constructor() {
        this.name = "Driver for Hermiebox"
    }

    log(pMsg, pVal = "") {
        console.log(`[Driver Hermiebox] - ${pMsg}`, pVal)
    }

    async connect(pKeys) {
        var server = await hermiebox.api.connect(pKeys)
        this.log("you are", server.id)
    }

    async public(opts) {
        var msgs = await hermiebox.api.pullPublic(opts)
        return msgs
    }

    async thread(msgid) {
        var msgs = await hermiebox.api.thread(msgid)
        return msgs
    }

    async setAvatarCache(feed, data) {
        let s = {}
        s[`avatar-${feed}`] = data
        return browser.storage.local.set(s)
    }

    async getCachedAvatar(feed) {
        return browser.storage.local.get(`avatar-${feed}`)
    }

    async avatar(feed) {
        try {
            let avatar = await hermiebox.api.avatar(feed)
            await this.setAvatarCache(feed, avatar)
            return avatar
        } catch (n) {
            throw n
        }

    }

    markdown(text) {

        function replaceMsgID(match, id, offset, string) {
            // p1 is nondigits, p2 digits, and p3 non-alphanumerics
            return "<a class=\"thread-link\" href=\"#!/thread/" + encodeURIComponent(id);
        }

        function replaceChannel(match, id, offset, string) {
            // p1 is nondigits, p2 digits, and p3 non-alphanumerics
            return "<a class=\"channel-link\" href=\"#!/channel/" + id;
        }


        function replaceFeedID(match, id, offset, string) {
            // p1 is nondigits, p2 digits, and p3 non-alphanumerics
            return "<a class=\"feed-link\" href=\"#!/feed/%40" + encodeURIComponent(id);
        }


        function replaceImageLinks(match, id, offset, string) {
            // p1 is nondigits, p2 digits, and p3 non-alphanumerics
            return "<a class=\"image-link\" target=\"_blank\" href=\"http://localhost:8989/blobs/get/&" + encodeURIComponent(id);
        }


        function replaceImages(match, id, offset, string) {
            // p1 is nondigits, p2 digits, and p3 non-alphanumerics
            return "<img class=\"is-image-from-blob\" src=\"http://localhost:8989/blobs/get/&" + encodeURIComponent(id);
        }

        let html = hermiebox.modules.ssbMarkdown.block(text)
        html = html
        // .replace(/<a href="#([^"]+?)/gi, replaceChannel)
            .replace(/<a href="@([^"]+?)/gi, replaceFeedID)
            //.replace(/target="_blank"/gi, "")
            .replace(/<a href="%([^"]+?)/gi, replaceMsgID)
            .replace(/<img src="&([^"]+?)/gi, replaceImages)
            .replace(/<a href="&([^"]+?)/gi, replaceImageLinks)


        return html
    }

    ref() {
        return hermiebox.modules.ssbRef
    }

    getTimestamp(msg) {
        const arrivalTimestamp = msg.timestamp;
        const declaredTimestamp = msg.value.timestamp;
        return Math.min(arrivalTimestamp, declaredTimestamp);
    }

    getRootMsgId(msg) {
        if (msg && msg.value && msg.value.content) {
            const root = msg.value.content.root;
            if (hermiebox.modules.ssbRef.isMsgId(root)) {
                return root;
            }
        }
    }
}


