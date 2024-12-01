try {
    importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js');

    const firebaseConfig = {
        apiKey: 'AIzaSyD6bYLcfnfRApmuxCgOZ1MYp5Z1riFpiwA',
        authDomain: 'oneinch-defi-wallet.firebaseapp.com',
        databaseURL: 'https://oneinch-defi-wallet-default-rtdb.firebaseio.com',
        projectId: 'oneinch-defi-wallet',
        storageBucket: 'oneinch-defi-wallet.appspot.com',
        messagingSenderId: '966229303750',
        appId: '1:966229303750:web:cf232371a0abc8e6b212c7',
        measurementId: 'G-0D949TV1F9',
    };

    self.addEventListener('install', (event) => {
        console.log('[sw] : Installing...');
    });

// Activate event - Clean up old caches
    self.addEventListener('activate', (event) => {
        console.log('[sw] : Activating...');
    });

// Fetch event - Serve cached content
    self.addEventListener('fetch', (event) => {
        console.log('[sw]: Fetching', event.request.url);
    });

    const app = firebase.initializeApp(firebaseConfig);

    const messaging = firebase.messaging();

    const scopeUrl = self.registration.scope;
    const dappOrigin = new URL(scopeUrl).origin;

    const listenerFn = (event) => {
        console.log('[sw] click on notifications ', event)
        console.log("On notification click: ", event.notification.tag);
        event.notification.close();

        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
                // eslint-disable-next-line no-console
                console.log('[sw] clientList', clientList);
                // Check if there is any open dapp tab
                for (let client of clientList) {
                    if (client.url.includes(dappOrigin) && 'focus' in client) {
                        // eslint-disable-next-line no-console
                        console.log('[sw] focus ', client);
                        return client.focus(); // Focus on the existing tab and break out of the loop
                    }
                }

                // If no tab is open, open a new one
                if (clients.openWindow) {
                    // eslint-disable-next-line no-console
                    console.log('[sw] open ', clients);
                    return clients.openWindow(`/`);
                }
            })
        );
    };

    messaging.onBackgroundMessage((payload) => {
        if (payload.data.type !== 'cross-chain') {
            return;
        }

        const notificationTitle = 'Title';
        const url = self.registration.scope;
        console.log('[sw] : url', url, ' oroigin', dappOrigin);
        const notificationOptions = {
            body: 'url: ' + dappOrigin,
            icon: 'https://1inch.io/img/pressRoom/1inch_without_text.webp',
        };

        self.removeEventListener('notificationclick', listenerFn);
        self.addEventListener('notificationclick', listenerFn);

        self.registration.showNotification(notificationTitle, notificationOptions);
    });



} catch (e) {
    console.error('[sw] : Error importing Firebase SDK', e);
}
