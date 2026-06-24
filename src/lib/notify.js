// Client-side notifications. True background push requires a server; this covers
// permission, a service worker, OS notifications when due, and scheduled triggers
// where the browser supports them (progressive enhancement).

export function notifySupported() {
  return typeof window !== "undefined" && "Notification" in window;
}
export function permissionStatus() {
  return notifySupported() ? Notification.permission : "unsupported";
}

export async function registerSW() {
  if (!("serviceWorker" in navigator)) return null;
  try { return await navigator.serviceWorker.register("./sw.js"); }
  catch { return null; }
}

export async function requestPermission() {
  if (!notifySupported()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try { return await Notification.requestPermission(); }
  catch { return "denied"; }
}

export async function showNotification(title, body, tag) {
  if (!notifySupported() || Notification.permission !== "granted") return false;
  const opts = { body, tag, icon: "./icon.svg", badge: "./icon.svg" };
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg && reg.showNotification) await reg.showNotification(title, opts);
    else new Notification(title, opts);
    return true;
  } catch { return false; }
}

// Best-effort future scheduling (Chromium Notification Triggers only).
export async function scheduleNotification(title, body, tag, timestamp) {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg && "showTrigger" in Notification.prototype && "TimestampTrigger" in window) {
      await reg.showNotification(title, {
        body, tag, icon: "./icon.svg",
        showTrigger: new window.TimestampTrigger(timestamp),
      });
      return true;
    }
  } catch {}
  return false;
}
