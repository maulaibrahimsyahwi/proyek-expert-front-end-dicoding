import "../styles/styles.css";
import App from "./pages/app";
import Api from "./data/api";

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
    toggleBtn.innerHTML = isSubscribed
      ? `<i class="fa-solid fa-bell-slash"></i> Matikan Notifikasi`
      : `<i class="fa-solid fa-bell"></i> Aktifkan Notifikasi`;
  };

  updateBtnText();

  toggleBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert(
        "Silakan masuk/login terlebih dahulu untuk mengaktifkan notifikasi.",
      );
      return;
    }

    if (isSubscribed) {
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await Api.unsubscribePushNotification(endpoint);
      }
      isSubscribed = false;
    } else {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const applicationServerKey = urlB64ToUint8Array(
          "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk",
        );
        const pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });

        await Api.subscribePushNotification(pushSubscription.toJSON());
        isSubscribed = true;
      } else {
        alert("Izin notifikasi ditolak oleh browser.");
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
