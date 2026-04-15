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
        <h1 style="margin-bottom: 24px; font-size: 2rem;">Beranda StoryApp</h1>
        <section class="home-layout">
          <div class="map-section">
            <h2>Peta Sebaran Cerita</h2>
            <div id="map" class="map-container" tabindex="0" aria-label="Peta interaktif sebaran cerita"></div>
          </div>
          <div class="list-section">
            <h2>Daftar Cerita</h2>
            <div id="story-list" class="story-grid"></div>
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
      .layers({ "Peta Jalan": osmLayer, "Topografi": topoLayer })
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
            <img src="${story.photoUrl}" alt="Foto ${story.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
            <br><strong>${story.name}</strong>
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
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">${showFormattedDate(story.createdAt)}</p>
          <p>${story.description.substring(0, 60)}...</p>
        </div>
      `;

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
    listContainer.innerHTML =
      "<p>Gagal memuat cerita. Silakan coba lagi nanti.</p>";
  }
}