export const environment = {
    t2y12PruGU9wUtEGzBJfolMIgK: "CAR:T-PAY:T-ANA:T-ACT:T-APP:T",
    production: false,
    remoteConfig: false,
    remoteConfigUrl: './chat-config.json',
    remoteContactsUrl: '',
    chatEngine: 'firebase',
    uploadEngine: 'firebase',
    pushEngine: 'firebase',
    fileUploadAccept: "*/*",
    firebaseConfig: {
        tenant: 'tilechat',
        apiKey: 'AIzaSyCoWXHNvP1-qOllCpTshhC6VjPXeRTK0T4',
        authDomain: 'chat21-pre-01.firebaseapp.com',
        databaseURL: 'https://chat21-pre-01.firebaseio.com',
        projectId: 'chat21-pre-01',
        storageBucket: 'chat21-pre-01.appspot.com',
        messagingSenderId: '269505353043',
        appId: '1:269505353043:web:b82af070572669e3707da6',
        chat21ApiUrl: 'https://us-central1-chat21-pre-01.cloudfunctions.net',
        vapidKey: 'BOsgS2ADwspKdWAmiFDZXEYqY1HSYADVfJT3j67wsySh3NxaViJqoabPJH8WM02wb5r8cQIm5TgM0UK047Z1D1c'
    },
    chat21Config: {
        appId: 'CHANGEIT',
        MQTTendpoint: 'CHANGEIT', // MQTT endpoint
        APIendpoint: 'CHANGEIT'
    },
    apiUrl: 'https://tiledesk-server-pre.herokuapp.com/',
    baseImageUrl: 'https://firebasestorage.googleapis.com/v0/b/',
    dashboardUrl: 'https://support-pre.tiledesk.com/dashboard/',
    wsUrl: 'wss://tiledesk-server-pre.herokuapp.com/',
    wsUrlRel: 'CHANGEIT',
    storage_prefix: 'chat_sv5',
    authPersistence: 'LOCAL',
    logLevel: 'Info',
    supportMode: true,
    archivedButton: true,
    writeToButton: true,
   
};
