export const environment = {
    t2y12PruGU9wUtEGzBJfolMIgK:"CAR:F-PAY:F-ANA:F-ACT:F-APP:F",
    version: require('../../package.json').version,
    production: false,
    remoteConfig: true,
    remoteConfigUrl: './chat-config.json',
    chatEngine: 'mqtt',
    uploadEngine: 'native',
    pushEngine: 'none',
    fileUploadAccept: "*/*",
    firebaseConfig: {
        tenant: 'CHANGEIT',
        apiKey: 'CHANGEIT',
        authDomain: 'CHANGEIT',
        databaseURL: 'CHANGEIT',
        projectId: 'CHANGEIT',
        storageBucket: 'CHANGEIT',
        messagingSenderId: 'CHANGEIT',
        appId: 'CHANGEIT',
        chat21ApiUrl: 'CHANGEIT',
        vapidKey: 'CHANGEIT'
    },
    chat21Config: {
        appId: 'tilechat',
        MQTTendpoint: 'mqtt://localhost:15675/ws', // MQTT endpoint
        APIendpoint: 'http://localhost:8004/api'
    },
    apiUrl: 'http://localhost:3000/',
    whatsappTemplatesBaseUrl: 'http://localhost:3000/',
    baseImageUrl: 'https://firebasestorage.googleapis.com/v0/b/',
    dashboardUrl: 'http://localhost:4500/',
    widgetBaseUrl:'http://localhost:4200/assets/twp/index.html',
    wsUrl: 'ws://localhost:3000/',
    wsUrlRel: 'CHANGEIT',
    storage_prefix: 'chat_sv5',
    authPersistence: 'LOCAL',
    logLevel: 'Info',
    supportMode: false,
    writeToButton: false,
    archivedButton: false,
    emailSection: true,
    whatsappTemplatesSection: true,
    googleMapsApiKey:"CHANGEIT"
};