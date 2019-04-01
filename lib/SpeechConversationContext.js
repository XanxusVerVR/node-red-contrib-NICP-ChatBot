const SpeechConversationContext = class _SpeechConversationContext {
    constructor(speechOutNodeId) {
        console.log("call constructor()");
        this._speechOutNodeId = speechOutNodeId;
    }

    get speechOutNodeId() {
        console.log("call get()");
        return this._speechOutNodeId;
    }

    set speechOutNodeId(newSpeechOutNodeId) {
        console.log("call set()");
        this._speechOutNodeId = newSpeechOutNodeId;
    }
};
module.exports = {
    SpeechConversationContext: SpeechConversationContext
};