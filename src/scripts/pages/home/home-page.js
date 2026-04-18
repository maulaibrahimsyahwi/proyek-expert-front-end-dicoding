import L from "leaflet";
import HomePresenter from "./home-presenter";
import { showFormattedDate } from "../../utils/index";

export default class HomePage {
  constructor() {
    this._presenter = new HomePresenter({ view: this });
    this._map = null;
    this._markers = {};
  }

  async render() {
    return `
      <div class="container">
        <h1><i class="fa-regular fa-compass" style="font-size: 28px; color: var(--primary);"></i> Eksplorasi Cerita</h1>
        <section class="home-layout">
          <div class="map-section">
            <h2 style="font-size: 1.25rem;"><i class="fa-solid fa-map-location-dot"></i> Peta Sebaran Cerita</h2>
            <div id="map" class="map-container" tabindex="0" aria-label="Peta interaktif sebaran cerita"></div>
          </div>
          <div class="list-section">
            <h2 style="font-size: 1.25rem;"><i class="fa-solid fa-list"></i> Daftar Cerita</h2>
            <div id="story-list" class="story-grid scrollable-list" style="grid-template-columns: 1fr;"></div>
          </div>
        </section>
      </div>
    `;
  }

  async afterRender() {
    this._initMap();
    await this._presenter.getAllStories();
  }

  _initMap() {
    this._map = L.map("map").setView([-6.2, 106.816666], 5);
    const osmLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "© OpenStreetMap",
      },
    );
    const topoLayer = L.tileLayer(
      "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      {
        attribution: "© OpenTopoMap",
      },
    );
    osmLayer.addTo(this._map);
    L.control
      .layers({ "Peta Jalan": osmLayer, Topografi: topoLayer })
      .addTo(this._map);
    setTimeout(() => this._map.invalidateSize(), 100);
  }

  showStories(stories) {
    const listContainer = document.getElementById("story-list");
    listContainer.innerHTML = "";

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this._map);
        marker.bindPopup(`
          <div style="text-align: center;">
            <img src="${story.photoUrl}" alt="Foto ${story.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
            <br><strong style="font-family: 'Inter', sans-serif;">${story.name}</strong>
          </div>
        `);
        this._markers[story.id] = marker;
      }

      const card = document.createElement("div");
      card.className = "story-card";
      card.tabIndex = 0;
      card.setAttribute("aria-label", `Cerita dari ${story.name}`);
      card.innerHTML = `
        <img src="${story.photoUrl}" alt="Foto cerita dari ${story.name}">
        <div class="card-body">
          <h3>${story.name}</h3>
          <p class="story-meta">
            <i class="fa-regular fa-calendar-days"></i> ${showFormattedDate(story.createdAt)}
          </p>
          <p class="story-desc">${story.description.substring(0, 80)}...</p>
        </div>
      `;

      const favBtn = document.createElement("button");
      favBtn.className = "btn btn-outline";
      favBtn.style.width = "100%";
      favBtn.innerHTML = `<i class="fa-regular fa-heart"></i> Simpan Favorit`;

      favBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const { idb, STORE_FAVORITE } = await import("../../data/idb");
        await idb.put(STORE_FAVORITE, story);
        favBtn.innerHTML = `<i class="fa-solid fa-heart" style="color: #ef4444;"></i> Tersimpan`;
        favBtn.style.borderColor = "#ef4444";
      });

      card.querySelector(".card-body").appendChild(favBtn);
      card.addEventListener("click", () => this._handleCardClick(story));
      card.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this._handleCardClick(story);
      });

      listContainer.appendChild(card);
    });
  }

  _handleCardClick(story) {
    const marker = this._markers[story.id];
    if (marker) {
      this._map.flyTo([story.lat, story.lon], 12);
      marker.openPopup();
      const icon = marker.getElement();
      if (icon) {
        icon.classList.add("marker-active");
        setTimeout(() => icon.classList.remove("marker-active"), 2000);
      }
    }
  }

  showErrorMessage() {
    const listContainer = document.getElementById("story-list");
    listContainer.innerHTML = `<p style="display:flex; align-items:center; gap:8px; color:#ef4444;"><i class="fa-solid fa-circle-exclamation"></i> Gagal memuat cerita. Silakan coba lagi nanti.</p>`;
  }
}
