import { api } from './api/client';

export type PushState =
  | 'unavailable' // this browser or this server cannot do push
  | 'needs-install' // iPhone/iPad: push only works once the app is on the home screen
  | 'blocked' // the user said no in the browser settings
  | 'off'
  | 'on';

// Both the button in the top bar and the hint on the book page listen for this,
// so turning notifications on in one place updates the other.
export const PUSH_CHANGED = 'wt-push-changed';

function announceChange(): void {
  window.dispatchEvent(new Event(PUSH_CHANGED));
}

function isAppleMobile(): boolean {
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

function runsFromHomeScreen(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches;
}

function browserSupportsPush(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function getPushState(): Promise<PushState> {
  if (!browserSupportsPush()) {
    // Safari on iPhone only offers push to web apps that were added to the home screen.
    return isAppleMobile() && !runsFromHomeScreen() ? 'needs-install' : 'unavailable';
  }
  const { publicKey } = await api.getPushKey();
  if (!publicKey) {
    return 'unavailable';
  }
  if (Notification.permission === 'denied') {
    return 'blocked';
  }
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return subscription ? 'on' : 'off';
}

export async function enablePush(): Promise<PushState> {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return permission === 'denied' ? 'blocked' : 'off';
  }

  const { publicKey } = await api.getPushKey();
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlToBytes(publicKey),
  });

  // The backend needs these three values to send a message to exactly this browser.
  const { endpoint, keys } = subscription.toJSON();
  if (!endpoint || !keys?.p256dh || !keys.auth) {
    throw new Error('De browser gaf geen geldig abonnement terug.');
  }
  await api.subscribePush(endpoint, keys.p256dh, keys.auth);
  announceChange();
  return 'on';
}

export async function disablePush(): Promise<void> {
  if (!browserSupportsPush()) {
    return;
  }
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) {
    return;
  }
  await api.unsubscribePush(subscription.endpoint);
  await subscription.unsubscribe();
  announceChange();
}

// The VAPID public key arrives as base64url text, the browser wants raw bytes.
function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    bytes[i] = raw.charCodeAt(i);
  }
  return bytes;
}
