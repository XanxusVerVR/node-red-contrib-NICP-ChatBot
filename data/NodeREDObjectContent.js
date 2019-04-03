// FCF-Facebook.js的FacebookBotNode function裡的this的內容
//this=self(node)
// 當NodeRED一起動的時候此this就存在了
//ex1
let FacebookBotNode = {
    id: "f9565e95.dc4da",
    type: "FCF-facebook-node",
    z: "",
    _closeCallbacks: [],
    wires: [],
    _wireCount: 0,
    send: [Function],
    credentials:
    {
        token: "EAADHleAADbkBAH52WeNvGhlnFmQl1sRNaSEgRnCD9mpBFpuhD1Nj501Cra5CtTTTCzcDeN7zcEF0KZAwz0rFWLCUeXXLw3KYYrZBL7sc9nXzZCG60rgEAPD8PizZAzWPugFGTz1ObZAVIHRH2ZCx5JPdcc53EcSZAPMurYQv3UIZBQZDZD",
        app_secret: "3f1bdb67c3e9985009e36505bab98761",
        verify_token: "123",
        webhookURL: "/park"
    }
};
//ex2
let FacebookBotNode2 = {
    id: "98bd3fe8.c4eb5",
    type: "FCF-facebook-node",
    z: "",
    _closeCallbacks: [],
    wires: [],
    _wireCount: 0,
    send: [Function],
    credentials:
    {
        token: "EAAQjsEZBbNxgBALqzenPjeGFaugrGIxQpQ3H8WIiDAlYUShTFJF57ZC6MbcGcE4UP0ojQnJ6rEnHJRGXdx1c4DB4ToYYoCNksvCV9ZClHyob4ptW4zCGYiqYBIGsbL8ElQbK8GAZA195wpj1eWZCdtk5qZBvTUCCGo7OJuPOsvSAZDZD",
        app_secret: "ef4905343a111e856770e7685d083ca3",
        verify_token: "456",
        webhookURL: "/phone"
    }
};

// FCF-Facebook.js的FacebookBotNode function參數的config的內容
// config
// 當NodeRED一起動的時候此this就存在了
//ex1
let n1 = {
    id: "98bd3fe8.c4eb5",
    type: "FCF-facebook-node",
    z: "",
    botname: "PhoneBot",
    _users:
        ["957d666a.de3fb8",
            "4aa247b2.1c4ec8",
            "6bf110b1.8d7eb",
            "453a48f0.0a4578",
            "f48a9360.2482c"]
};
//ex2
let n2 = {
    id: "f9565e95.dc4da",
    type: "FCF-facebook-node",
    z: "",
    botname: "\bParkingBot",
    _users:
        ["c9d332fb.33ccd",
            "39cca4b5.ba90ac",
            "f773d504.77be38",
            "950eda1d.64a598"]
};

// FCF-Facebook.js的FacebookBotNode function中的this.handleMessage參考的function的self.bot的內容
// self.bot
// ex1
let Bot1 = {
    token: "EAAQjsEZBbNxgBALqzenPjeGFaugrGIxQpQ3H8WIiDAlYUShTFJF57ZC6MbcGcE4UP0ojQnJ6rEnHJRGXdx1c4DB4ToYYoCNksvCV9ZClHyob4ptW4zCGYiqYBIGsbL8ElQbK8GAZA195wpj1eWZCdtk5qZBvTUCCGo7OJuPOsvSAZDZD",
    app_secret: "ef4905343a111e856770e7685d083ca3",
    verify_token: "456",
    webhookURL: "/phone",
    domain: null,
    _events:
    {
        message: [Function],
        postback: [Function],
        account_linking: [Function],
        relay: [Function]
    },
    _eventsCount: 4,
    _maxListeners: undefined
};

// FCF-Facebook.js的FacebookBotNode function中的n.log的內容
console.log(n.log);//印出undefined
console.log(this.log);//印出undefined
//因為n物件裡根本沒有log這個屬性

// FCF-Facebook.js的FacebookBotNode function中this.handleMessage所參考的function參數物件的內容
let botMsg = {
    sender: { id: "1267275450038190" },
    recipient: { id: "435323206824399" },
    timestamp: 1547034901608,
    message:
    {
        mid: "jO_JxnjX-ELixmwKe3-ykh_0GxCFfEUKu9rm71alazfBgdlj38c1qFRv2Mc46vnBp9yGBMpqihMOoiRjIU7Rsw",
        seq: 1528,
        text: "哈囉"
    }
};

// chat-context-store.js getOrCreateChatContext方法中的store[chatId]物件的內容
//在手機選購案例中，第一次說哈囉還沒有東西，是undefined，第二次說話說HTC就會有東西了，就是以下的內容
let chatContext = {
    get: [Function],
    remove: [Function],
    set: [Function],
    dump: [Function],
    all: [Function],
    clear: [Function]
};

// FCF-Facebook.js的FacebookBotNode function中this.handleMessage所參考的function的chatContext物件的內容
//在手機選購案例中，第一次說哈囉就有東西了，他就回傳以下的內容了
let chatContext2 = {
    get: [Function],
    remove: [Function],
    set: [Function],
    dump: [Function],
    all: [Function],
    clear: [Function]
};

//FCF-Facebook.js中的FacebookInNode方法中的node.bot.on回呼函式的message物件的內容:
let message = {
    payload:{
        chatId: "1267275450038190",
        messageId: "V3WcChZHL40_kMc4wQrq1x_0GxCFfEUKu9rm71alazf-cG-QZ0-wwD4d6qAiJYT5qsgwifQElJ5yM-AYG91Nhw",
        type: "message",
        content: "哈囉",
        date: moment("2019-01-12T21:27:15.521"),
        inbound: true
    },
    originalMessage: {
        transport: "facebook",
        chat: {
            id: "1267275450038190"
        }
    },
    chat: [Function]
};

//FCF-Facebook.js中的FacebookInNode方法中的node.bot.on回呼函式的message物件的內容:
/* FacebookInNode {
    id: '957d666a.de3fb8',
    type: 'FCF-facebook-receive',
    z: '9fdb8a20.7c04d8',
    _closeCallbacks: [],
    wires: [ [ '15cd9267.0a04de' ] ],
    _wireCount: 1,
    send: [Function],
    _wire: '15cd9267.0a04de',
    bot:
    Bot {
    token: 'EAAQjsEZBbNxgBALqzenPjeGFaugrGIxQpQ3H8WIiDAlYUShTFJF57ZC6MbcGcE4UP0ojQnJ6rEnHJRGXdx1c4DB4ToYYoCNksvCV9ZClHyob4ptW4zCGYiqYBIGsbL8ElQbK8GAZA195wpj1eWZCdtk5qZBvTUCCGo7OJuPOsvSAZDZD',
    app_secret: 'ef4905343a111e856770e7685d083ca3',
    verify_token: '456',
    webhookURL: '/phone',
    domain: null,
    _events:
    { message: [Function],
    postback: [Function],
    account_linking: [Function],
    relay: [Function] },
    _eventsCount: 4,
    _maxListeners: undefined },
    config:
    FacebookBotNode {
    id: '98bd3fe8.c4eb5',
    type: 'FCF-facebook-node',
    z: '',
    _closeCallbacks: [ [Function] ],
    wires: [],
    _wireCount: 0,
    send: [Function],
    credentials:
    { token: 'EAAQjsEZBbNxgBALqzenPjeGFaugrGIxQpQ3H8WIiDAlYUShTFJF57ZC6MbcGcE4UP0ojQnJ6rEnHJRGXdx1c4DB4ToYYoCNksvCV9ZClHyob4ptW4zCGYiqYBIGsbL8ElQbK8GAZA195wpj1eWZCdtk5qZBvTUCCGo7OJuPOsvSAZDZD',
    app_secret: 'ef4905343a111e856770e7685d083ca3',
    verify_token: '456',
    webhookURL: '/phone' },
    botname: 'PhoneBot',
    log: undefined,
    usernames: [],
    handleMessage: [Function],
    token: 'EAAQjsEZBbNxgBALqzenPjeGFaugrGIxQpQ3H8WIiDAlYUShTFJF57ZC6MbcGcE4UP0ojQnJ6rEnHJRGXdx1c4DB4ToYYoCNksvCV9ZClHyob4ptW4zCGYiqYBIGsbL8ElQbK8GAZA195wpj1eWZCdtk5qZBvTUCCGo7OJuPOsvSAZDZD',
    app_secret: 'ef4905343a111e856770e7685d083ca3',
    verify_token: '456',
    webhookURL: '/phone',
    bot:
    Bot {
    token: 'EAAQjsEZBbNxgBALqzenPjeGFaugrGIxQpQ3H8WIiDAlYUShTFJF57ZC6MbcGcE4UP0ojQnJ6rEnHJRGXdx1c4DB4ToYYoCNksvCV9ZClHyob4ptW4zCGYiqYBIGsbL8ElQbK8GAZA195wpj1eWZCdtk5qZBvTUCCGo7OJuPOsvSAZDZD',
    app_secret: 'ef4905343a111e856770e7685d083ca3',
    verify_token: '456',
    webhookURL: '/phone',
    domain: null,
    _events: [Object],
    _eventsCount: 4,
    _maxListeners: undefined },
    isAuthorized: [Function],
    getMessageDetails: [Function] } } */


//可以印出RED底下的function
console.log(Object.getOwnPropertyNames(RED).filter(function (p) {
    return typeof RED[p] === "function";
}));
//RED物件內容:
/* [ { createNode: [Function: createNode],
    getNode: [Function: getNode],
    eachNode: [Function: eachNode],
    addCredentials: [Function: add],
    getCredentials: [Function: get],
    deleteCredentials: [Function: delete],
    registerType: [Function] },
    { FATAL: 10,
    ERROR: 20,
    WARN: 30,
    INFO: 40,
    DEBUG: 50,
    TRACE: 60,
    AUDIT: 98,
    METRIC: 99,
    addHandler: [Function: addHandler],
    removeHandler: [Function: removeHandler],
    log: [Function: log],
    info: [Function: info],
    warn: [Function: warn],
    error: [Function: error],
    trace: [Function: trace],
    debug: [Function: debug],
    metric: [Function: metric],
    audit: [Function: audit],
    _: [Function] },
    { get: [Function: get],
    set: [Function: set],
    delete: [Function: delete],
    available: [Function: available],
    registerNodeSettings: [Function: registerNodeSettings],
    exportNodeSettings: [Function: exportNodeSettings],
    enableNodeSettings: [Function: enableNodeSettings],
    disableNodeSettings: [Function: disableNodeSettings],
    getUserSettings: [Function: getUserSettings],
    setUserSettings: [Function: setUserSettings],
    uiPort: [Getter/Setter],
    uiHost: [Getter/Setter],
    mqttReconnectTime: [Getter/Setter],
    serialReconnectTime: [Getter/Setter],
    debugMaxLength: [Getter/Setter],
    flowFile: [Getter/Setter],
    flowFilePretty: [Getter/Setter],
    adminAuth: [Getter/Setter],
    functionGlobalContext: [Getter/Setter],
    logging: [Getter/Setter],
    settingsFile: [Getter/Setter],
    httpRoot: [Getter/Setter],
    disableEditor: [Getter/Setter],
    httpAdminRoot: [Getter/Setter],
    httpAdminAuth: [Getter/Setter],
    httpNodeRoot: [Getter/Setter],
    httpNodeAuth: [Getter/Setter],
    coreNodesDir: [Getter/Setter],
    version: [Getter/Setter],
    userDir: "/home/pi/.node-red" },
    EventEmitter {
    domain: null,
    _events:
    { "type-registered": [Function],
    "node-icon-dir": [Function: nodeIconDir],
    "node-examples-dir": [Function: addNodeExamplesDir],
    "node-module-uninstalled": [Function: removeNodeExamplesDir],
    "node-status": [Function: handleStatus],
    "runtime-event": [Function: handleRuntimeEvent] },
    _eventsCount: 6,
    _maxListeners: undefined },
    { encodeObject: [Function: encodeObject],
    ensureString: [Function: ensureString],
    ensureBuffer: [Function: ensureBuffer],
    cloneMessage: [Function: cloneMessage],
    compareObjects: [Function: compareObjects],
    generateId: [Function: generateId],
    getMessageProperty: [Function: getMessageProperty],
    setMessageProperty: [Function: setMessageProperty],
    getObjectProperty: [Function: getObjectProperty],
    setObjectProperty: [Function: setObjectProperty],
    evaluateNodeProperty: [Function: evaluateNodeProperty],
    normalisePropertyExpression: [Function: normalisePropertyExpression],
    normaliseNodeTypeName: [Function: normaliseNodeTypeName],
    prepareJSONataExpression: [Function: prepareJSONataExpression],
    evaluateJSONataExpression: [Function: evaluateJSONataExpression],
    parseContextStore: [Function: parseContextStore] },
    [Function: getVersion],
    [Function: requireModule],
    { publish: [Function: publish] },
    { register: [Function: register] },
    { needsPermission: [Function: needsPermission] },
    { [EventEmitter: app]
    domain: undefined,
    _events: { mount: [Function: onmount] },
    _maxListeners: undefined,
    setMaxListeners: [Function: setMaxListeners],
    getMaxListeners: [Function: getMaxListeners],
    emit: [Function: emit],
    addListener: [Function: addListener],
    on: [Function: addListener],
    prependListener: [Function: prependListener],
    once: [Function: once],
    prependOnceListener: [Function: prependOnceListener],
    removeListener: [Function: removeListener],
    removeAllListeners: [Function: removeAllListeners],
    listeners: [Function: listeners],
    listenerCount: [Function: listenerCount],
    eventNames: [Function: eventNames],
    init: [Function: init],
    defaultConfiguration: [Function: defaultConfiguration],
    lazyrouter: [Function: lazyrouter],
    handle: [Function: handle],
    use: [Function: use],
    route: [Function: route],
    engine: [Function: engine],
    param: [Function: param],
    set: [Function: set],
    path: [Function: path],
    enabled: [Function: enabled],
    disabled: [Function: disabled],
    enable: [Function: enable],
    disable: [Function: disable],
    acl: [Function],
    bind: [Function],
    checkout: [Function],
    connect: [Function],
    copy: [Function],
    delete: [Function],
    get: [Function],
    head: [Function],
    link: [Function],
    lock: [Function],
    "m-search": [Function],
    merge: [Function],
    mkactivity: [Function],
    mkcalendar: [Function],
    mkcol: [Function],
    move: [Function],
    notify: [Function],
    options: [Function],
    patch: [Function],
    post: [Function],
    propfind: [Function],
    proppatch: [Function],
    purge: [Function],
    put: [Function],
    rebind: [Function],
    report: [Function],
    search: [Function],
    source: [Function],
    subscribe: [Function],
    trace: [Function],
    unbind: [Function],
    unlink: [Function],
    unlock: [Function],
    unsubscribe: [Function],
    all: [Function: all],
    del: [Function],
    render: [Function: render],
    listen: [Function: listen],
    request: IncomingMessage { app: [Circular] },
    response: ServerResponse { app: [Circular] },
    cache: {},
    engines: {},
    settings:
    { "x-powered-by": true,
    etag: "weak",
    "etag fn": [Function: generateETag],
    env: "development",
    "query parser": "extended",
    "query parser fn": [Function: parseExtendedQueryString],
    "subdomain offset": 2,
    view: [Function: View],
    views: "/home/pi/views",
    "jsonp callback name": "callback" },
    _eventsCount: 1,
    locals: { settings: [Object] },
    mountpath: "/",
    _router:
    { [Function: router]
    params: {},
    _params: [],
    caseSensitive: false,
    mergeParams: undefined,
    strict: false,
    stack: [Array] },
    parent:
    { [EventEmitter: app]
    domain: undefined,
    _events: [Object],
    _maxListeners: undefined,
    setMaxListeners: [Function: setMaxListeners],
    getMaxListeners: [Function: getMaxListeners],
    emit: [Function: emit],
    addListener: [Function: addListener],
    on: [Function: addListener],
    prependListener: [Function: prependListener],
    once: [Function: once],
    prependOnceListener: [Function: prependOnceListener],
    removeListener: [Function: removeListener],
    removeAllListeners: [Function: removeAllListeners],
    listeners: [Function: listeners],
    listenerCount: [Function: listenerCount],
    eventNames: [Function: eventNames],
    init: [Function: init],
    defaultConfiguration: [Function: defaultConfiguration],
    lazyrouter: [Function: lazyrouter],
    handle: [Function: handle],
    use: [Function: use],
    route: [Function: route],
    engine: [Function: engine],
    param: [Function: param],
    set: [Function: set],
    path: [Function: path],
    enabled: [Function: enabled],
    disabled: [Function: disabled],
    enable: [Function: enable],
    disable: [Function: disable],
    acl: [Function],
    bind: [Function],
    checkout: [Function],
    connect: [Function],
    copy: [Function],
    delete: [Function],
    get: [Function],
    head: [Function],
    link: [Function],
    lock: [Function],
    "m-search": [Function],
    merge: [Function],
    mkactivity: [Function],
    mkcalendar: [Function],
    mkcol: [Function],
    move: [Function],
    notify: [Function],
    options: [Function],
    patch: [Function],
    post: [Function],
    propfind: [Function],
    proppatch: [Function],
    purge: [Function],
    put: [Function],
    rebind: [Function],
    report: [Function],
    search: [Function],
    source: [Function],
    subscribe: [Function],
    trace: [Function],
    unbind: [Function],
    unlink: [Function],
    unlock: [Function],
    unsubscribe: [Function],
    all: [Function: all],
    del: [Function],
    render: [Function: render],
    listen: [Function: listen],
    request: [Object],
    response: [Object],
    cache: {},
    engines: {},
    settings: [Object],
    _eventsCount: 1,
    locals: [Object],
    mountpath: "/",
    _router: [Object] } },
    { [EventEmitter: app]
    domain: undefined,
    _events: { mount: [Function: onmount] },
    _maxListeners: undefined,
    setMaxListeners: [Function: setMaxListeners],
    getMaxListeners: [Function: getMaxListeners],
    emit: [Function: emit],
    addListener: [Function: addListener],
    on: [Function: addListener],
    prependListener: [Function: prependListener],
    once: [Function: once],
    prependOnceListener: [Function: prependOnceListener],
    removeListener: [Function: removeListener],
    removeAllListeners: [Function: removeAllListeners],
    listeners: [Function: listeners],
    listenerCount: [Function: listenerCount],
    eventNames: [Function: eventNames],
    init: [Function: init],
    defaultConfiguration: [Function: defaultConfiguration],
    lazyrouter: [Function: lazyrouter],
    handle: [Function: handle],
    use: [Function: use],
    route: [Function: route],
    engine: [Function: engine],
    param: [Function: param],
    set: [Function: set],
    path: [Function: path],
    enabled: [Function: enabled],
    disabled: [Function: disabled],
    enable: [Function: enable],
    disable: [Function: disable],
    acl: [Function],
    bind: [Function],
    checkout: [Function],
    connect: [Function],
    copy: [Function],
    delete: [Function],
    get: [Function],
    head: [Function],
    link: [Function],
    lock: [Function],
    "m-search": [Function],
    merge: [Function],
    mkactivity: [Function],
    mkcalendar: [Function],
    mkcol: [Function],
    move: [Function],
    notify: [Function],
    options: [Function],
    patch: [Function],
    post: [Function],
    propfind: [Function],
    proppatch: [Function],
    purge: [Function],
    put: [Function],
    rebind: [Function],
    report: [Function],
    search: [Function],
    source: [Function],
    subscribe: [Function],
    trace: [Function],
    unbind: [Function],
    unlink: [Function],
    unlock: [Function],
    unsubscribe: [Function],
    all: [Function: all],
    del: [Function],
    render: [Function: render],
    listen: [Function: listen],
    request: IncomingMessage { app: [Circular] },
    response: ServerResponse { app: [Circular] },
    cache: {},
    engines: {},
    settings:
    { "x-powered-by": true,
    etag: "weak",
    "etag fn": [Function: generateETag],
    env: "development",
    "query parser": "extended",
    "query parser fn": [Function: parseExtendedQueryString],
    "subdomain offset": 2,
    view: [Function: View],
    views: "/home/pi/views",
    "jsonp callback name": "callback" },
    _eventsCount: 1,
    locals: { settings: [Object] },
    mountpath: "/",
    parent:
    { [EventEmitter: app]
    domain: undefined,
    _events: [Object],
    _maxListeners: undefined,
    setMaxListeners: [Function: setMaxListeners],
    getMaxListeners: [Function: getMaxListeners],
    emit: [Function: emit],
    addListener: [Function: addListener],
    on: [Function: addListener],
    prependListener: [Function: prependListener],
    once: [Function: once],
    prependOnceListener: [Function: prependOnceListener],
    removeListener: [Function: removeListener],
    removeAllListeners: [Function: removeAllListeners],
    listeners: [Function: listeners],
    listenerCount: [Function: listenerCount],
    eventNames: [Function: eventNames],
    init: [Function: init],
    defaultConfiguration: [Function: defaultConfiguration],
    lazyrouter: [Function: lazyrouter],
    handle: [Function: handle],
    use: [Function: use],
    route: [Function: route],
    engine: [Function: engine],
    param: [Function: param],
    set: [Function: set],
    path: [Function: path],
    enabled: [Function: enabled],
    disabled: [Function: disabled],
    enable: [Function: enable],
    disable: [Function: disable],
    acl: [Function],
    bind: [Function],
    checkout: [Function],
    connect: [Function],
    copy: [Function],
    delete: [Function],
    get: [Function],
    head: [Function],
    link: [Function],
    lock: [Function],
    "m-search": [Function],
    merge: [Function],
    mkactivity: [Function],
    mkcalendar: [Function],
    mkcol: [Function],
    move: [Function],
    notify: [Function],
    options: [Function],
    patch: [Function],
    post: [Function],
    propfind: [Function],
    proppatch: [Function],
    purge: [Function],
    put: [Function],
    rebind: [Function],
    report: [Function],
    search: [Function],
    source: [Function],
    subscribe: [Function],
    trace: [Function],
    unbind: [Function],
    unlink: [Function],
    unlock: [Function],
    unsubscribe: [Function],
    all: [Function: all],
    del: [Function],
    render: [Function: render],
    listen: [Function: listen],
    request: [Object],
    response: [Object],
    cache: {},
    engines: {},
    settings: [Object],
    _eventsCount: 1,
    locals: [Object],
    mountpath: "/",
    _router: [Object] } },
    Server {
    domain: null,
    _events:
    { request: [Function],
    connection: [Function: connectionListener] },
    _eventsCount: 2,
    _maxListeners: 0,
    _connections: 0,
    _handle: null,
    _usingSlaves: false,
    _slaves: [],
    _unref: false,
    allowHalfOpen: true,
    pauseOnConnect: false,
    httpAllowHalfOpen: false,
    timeout: 120000,
    keepAliveTimeout: 5000,
    _pendingResponseData: 0,
    maxHeadersCount: null,
    headersTimeout: 40000,
    [Symbol(IncomingMessage)]: { [Function: IncomingMessage] super_: [Object] },
    [Symbol(ServerResponse)]: { [Function: ServerResponse] super_: [Object] },
    [Symbol(asyncId)]: -1 },
    [Function] ] */

// RED底下的第二層屬性
let REDProperty = [
    "nodes",
    "log",
    "settings",
    "events",
    "util",
    "version",
    "require",
    "comms",
    "library",
    "auth",
    "httpAdmin",
    "httpNode",
    "server",
    "_"
];

//transformation(原change節點)的Config物件裡的資料
let transformationConfig = {
    id: "30df5900.e78696",
    type: "FCF-Transformation",
    z: "8f8a71ea.ab8d6",
    name: "",
    rules:
        [{
            t: "set",
            p: "yyy",
            pt: "flow",
            to: "payload",
            tot: "msg",
            fromt: "str"
        }],
    action: "",
    property: "",
    from: "",
    to: "",
    reg: false,
    x: 350,
    y: 280,
    wires: [["6d068677.44d5d8"]]
};

//Facebook In節點輸出的完整物件
let FacebookInNodeOutCompleteMsgObject =
{
    "payload": {
        "chatId": "1267275450038190",
        "messageId": "gb9zEmTseeacE0RrZ65WhB_0GxCFfEUKu9rm71alazfbiprBXWQHVFBmBs-w66xkc4T7W8IdxRXVJO9EQl3iww",
        "type": "message",
        "content": "幫我開個電扇",
        "date": "2019-04-03T12:53:54.139Z",
        "inbound": true,
        "first_name": "Zetas",
        "last_name": "Los"
    },
    "originalMessage": {
        "transport": "facebook",
        "chat": {
            "id": "1267275450038190"
        }
    },
    "_msgid": "21570b3e.7ac454"
};

// DataCollection節點收集完資料後，存到Frame節點中，並且輸出長這樣
let frameNodeOutputObject =
{
    "payload": {
        "chatId": "1267275450038190",
        "messageId": "Xu3lOMDPz_o5NBqk_46ndh_0GxCFfEUKu9rm71alazeYQzHGr-gxPL5UneZOsZ9ij-p7r1hm8z4Vp8mqatE2Hw",
        "type": "message",
        "content": "172",
        "date": "2019-04-03T13:26:07.174Z",
        "inbound": true,
        "first_name": "Zetas",
        "last_name": "Los"
    },
    "originalMessage": {
        "transport": "facebook",
        "chat": {
            "id": "1267275450038190"
        }
    },
    "_msgid": "545d5004.aa56d",
    "_event": "node:cf07e194.ca48e",
    "whetherToSendLocation": false,
    "query": {
        "phoneNumber": "09380062826",
        "tall": "172"
    },
    "frame": {
        "query": {
            "phoneNumber": "09380062826",
            "tall": "172"
        },
        "userData": {},
        "result": {}
    }
};