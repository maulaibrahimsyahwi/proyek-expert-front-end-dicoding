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
        <h1>Eksplorasi Cerita</h1>
        <section class="home-layout">
          <div class="map-section">
            <h2>Peta Sebaran Cerita</h2>
            <div id="map" class="map-container" tabindex="0" aria-label="Peta interaktif sebaran cerita"></div>
          </div>
          <div class="list-section">
            <h2>Daftar Cerita</h2>
            <div id="story-list" class="story-grid scrollable-list"></div>
          </div>
        </section>
      </div>
    `;
  }

  async afterRender() {
    this._initMap();
    this.showLoading();
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

  showLoading() {
    const listContainer = document.getElementById("story-list");
    listContainer.innerHTML = Array(4)
      .fill(
        `
        <div class="story-card">
          <div class="skeleton skeleton-img"></div>
          <div class="card-body">
            <div class="skeleton" style="height: 24px; width: 60%; margin-bottom: 12px;"></div>
            <div class="skeleton" style="height: 16px; width: 40%; margin-bottom: 24px;"></div>
            <div class="skeleton" style="height: 14px; width: 100%; margin-bottom: 8px;"></div>
            <div class="skeleton" style="height: 14px; width: 80%; margin-bottom: 24px;"></div>
            <div class="skeleton" style="height: 48px; width: 100%; border-radius: var(--radius-md);"></div>
          </div>
        </div>
      `,
      )
      .join("");
  }

  showStories(stories) {
    const listContainer = document.getElementById("story-list");
    listContainer.innerHTML = "";

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this._map);
        marker.bindPopup(`
          <div style="text-align: center;">
            <img src="${story.photoUrl}" alt="Foto ${story.name}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 12px; margin-bottom: 12px; box-shadow: var(--shadow-sm);">
            <br><strong style="font-family: 'Inter', sans-serif; font-size: 1.1rem; color: var(--text-main);">${story.name}</strong>
          </div>
        `);
        this._markers[story.id] = marker;
      }

      const card = document.createElement("div");
      card.className = "story-card";
      card.tabIndex = 0;
      card.setAttribute("aria-label", `Cerita dari ${story.name}`);
      card.innerHTML = `
        <img src="${story.photoUrl}" alt="Foto cerita dari ${story.name}" loading="lazy">
        <div class="card-body">
          <h3>${story.name}</h3>
          <p class="story-meta">
            <i class="fa-regular fa-calendar-days"></i> ${showFormattedDate(story.createdAt)}
          </p>
          <p class="story-desc">${story.description.substring(0, 100)}...</p>
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
        favBtn.style.backgroundColor = "#fef2f2";
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
      this._map.flyTo([story.lat, story.lon], 13, {
        animate: true,
        duration: 1.5,
      });
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
    listContainer.innerHTML = `
      <div style="background-color: #fef2f2; border: 1px solid #f87171; padding: 24px; border-radius: var(--radius-md); text-align: center;">
        <i class="fa-solid fa-circle-exclamation" style="font-size: 32px; color: #ef4444; margin-bottom: 12px;"></i>
        <h3 style="color: #991b1b; margin-bottom: 8px;">Gagal Memuat Cerita</h3>
        <p style="color: #b91c1c;">Silakan periksa koneksi internet Anda dan coba lagi nanti.</p>
      </div>
    `;
  }
}
