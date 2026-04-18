import "../styles/styles.css";
import App from "./pages/app";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });
  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });

  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      setupPushToggle(registration);
    } catch (err) {}
  }
});

async function setupPushToggle(registration) {
  const toggleBtn = document.getElementById("push-toggle");
  if (!toggleBtn) return;

  const subscription = await registration.pushManager.getSubscription();
  let isSubscribed = subscription !== null;

  const updateBtnText = () => {
    toggleBtn.innerText = isSubscribed
      ? "Matikan Notifikasi"
      : "Aktifkan Notifikasi";
  };

  updateBtnText();

  toggleBtn.addEventListener("click", async () => {
    if (isSubscribed) {
      const sub = await registration.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      isSubscribed = false;
    } else {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const applicationServerKey = urlB64ToUint8Array(
          "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U",
        );
        await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
        isSubscribed = true;
      }
    }
    updateBtnText();
  });
}

function urlB64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
