const TextConversationContext = class _TextConversationContext {
    constructor(textOutNodeId, chatId, transport) {
        this._textOutNodeId = textOutNodeId;
        this._chatId = chatId;
        this._transport = transport;
    }

    get textOutNodeId() {
        return this._textOutNodeId;
    }
    set textOutNodeId(newTextOutNodeId) {
        this._textOutNodeId = newTextOutNodeId;
    }

    get chatId() {
        return this._chatId;
    }
    set chatId(newChatId) {
        this._chatId = newChatId;
    }

    get transport() {
        return this._transport;
    }
    set transport(newTransport) {
        this._transport = newTransport;
    }

    clear() {
        this._textOutNodeId = "";
        this._chatId = "";
        this._transport = "";
    }
};
module.exports = {
    TextConversationContext: TextConversationContext
};