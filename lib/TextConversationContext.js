const TextConversationContext = class _TextConversationContext {
    constructor(textOutNodeId) {
        this._textOutNodeId = textOutNodeId;
    }

    get textOutNodeId() {
        return this._textOutNodeId;
    }

    set textOutNodeId(newTextOutNodeId) {
        this._textOutNodeId = newTextOutNodeId;
    }
};
module.exports = {
    TextConversationContext: TextConversationContext
};