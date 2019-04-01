const SpeechConversationContext = class _SpeechConversationContext {
    constructor(speechOutNodeId) {
        this._speechOutNodeId = speechOutNodeId;
    }

    get speechOutNodeId() {
        return this._speechOutNodeId;
    }

    set speechOutNodeId(newSpeechOutNodeId) {
        this._speechOutNodeId = newSpeechOutNodeId;
    }
};
module.exports = {
    SpeechConversationContext: SpeechConversationContext
};