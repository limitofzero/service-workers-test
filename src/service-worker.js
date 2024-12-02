/* eslint-disable no-undef */

const scopeUrl = self.registration.scope;
const dappOrigin = new URL(scopeUrl).origin;

self.addEventListener('notificationclick', (event) => {
    console.log('[sw] notificationclick')
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if there is any open dapp tab
            for (let client of clientList) {
                if (client.url.includes(dappOrigin) && 'focus' in client) {
                    return client.focus(); // Focus on the existing tab and break out of the loop
                }
            }

            // If no tab is open, open a new one
            if (clients.openWindow) {
                return clients.openWindow(`${scopeUrl}`);
            }
        }),
    );
});

self.addEventListener('install', (event) => {
    console.log('[sw] installing');
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    console.log('[sw] activating');
    event.waitUntil(clients.claim());
});

try {
    importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js');

    // Firebase config is the same for all environments (dev/prod/stage)
    // and for all contexts (page window context or service worker self context)
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

    const app = firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        if (payload.data.type !== 'cross-chain') {
            return;
        }

        const notificationTitle = '1inch Fusion+ Swap Active';
        const notificationOptions = {
            body: 'Keep tab open to complete swap',
            icon: 'https://1inch.io/img/pressRoom/1inch_without_text.webp',
        };

        console.log('[sw] get showNotification')
        self.registration.showNotification(notificationTitle, notificationOptions);
    });
} catch (e) {
    console.error('Firebase client init error', e);
}
