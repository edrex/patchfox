/**
 * COMPONENT "CHANNEL MESSAGE"
 * 
 * OBJECTIVE:
 * A component that renders a single message.
 * 
 * This is a Mithril component.
 */

import GenericMessage from "./generic-message.js"

export default class PostMessage extends GenericMessage {

    constructor(vnode) {
        super(vnode)
        this.msg = vnode.attrs.msg
    }

    content(msg) {
        let text = msg.value.content.text
        let html = ssb.markdown(text)

        return html
    }

    header(msg) {
        return ""
    }

}
