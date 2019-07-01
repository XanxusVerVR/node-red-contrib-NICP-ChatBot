const TextConversationContext = class _TextConversationContext {
    constructor(textOutNodeId, chatId, transport, query) {
        this._textOutNodeId = textOutNodeId;
        this._chatId = chatId;
        this._transport = transport;
        this._query = query;
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

    get query() {
        return this._query;
    }
    set query(newQuery) {
        this._query = newQuery;
    }

    clear() {
        this._textOutNodeId = "";
        this._chatId = "";
        this._transport = "";
        this._query = "";
    }
};
module.exports = {
    TextConversationContext: TextConversationContext
};