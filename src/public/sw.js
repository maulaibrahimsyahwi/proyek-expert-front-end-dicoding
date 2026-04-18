const CACHE_NAME = "story-app-v1";
const API_CACHE = "story-api-cache-v1";

const assetsToCache = [
  "/",
  "/index.html",
  "/favicon.png",
  "/manifest.json",
  "/images/logo.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(assetsToCache)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (
    event.request.url.includes("story-api.dicoding.dev/v1/stories") &&
    event.request.method === "GET"
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(API_CACHE).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(async () => {
          const response = await caches.match(event.request);
          if (response) return response;
          throw new Error("Offline");
        }),
    );
  } else {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => response || fetch(event.request)),
    );
  }
});

self.addEventListener("push", (event) => {
  let data = {
    title: "StoryApp",
    body: "Ada pembaruan cerita!",
    icon: "/favicon.png",
  };
  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }
  const options = {
    body: data.body,
    icon: data.icon || "/favicon.png",
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now(), primaryKey: "1" },
    actions: [{ action: "explore", title: "Buka Aplikasi" }],
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "explore" || !event.action) {
    event.waitUntil(clients.openWindow("/#/"));
  }
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-new-story") {
    event.waitUntil(syncStories());
  }
});

async function syncStories() {
  const dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open("story-app-db", 1);
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
  const db = await dbPromise;
  const getTransaction = db.transaction("sync-stories", "readonly");
  const store = getTransaction.objectStore("sync-stories");
  const getAllRequest = store.getAll();

  const stories = await new Promise((resolve, reject) => {
    getAllRequest.onsuccess = () => resolve(getAllRequest.result);
    getAllRequest.onerror = () => reject(getAllRequest.error);
  });

  for (const data of stories) {
    const formData = new FormData();
    formData.append("description", data.description);
    formData.append("photo", data.photo);
    if (data.lat && data.lon) {
      formData.append("lat", data.lat);
      formData.append("lon", data.lon);
    }

    try {
      const response = await fetch(
        "https://story-api.dicoding.dev/v1/stories",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${data.token}` },
          body: formData,
        },
      );

      if (response.ok) {
        const delTransaction = db.transaction("sync-stories", "readwrite");
        delTransaction.objectStore("sync-stories").delete(data.id);
        self.registration.showNotification("StoryApp", {
          body: "Cerita offline Anda berhasil disinkronisasi ke server!",
          icon: "/favicon.png",
        });
      }
    } catch (error) {}
  }
}
