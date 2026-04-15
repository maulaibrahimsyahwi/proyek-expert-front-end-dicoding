import L from "leaflet";
import Api from "../../data/api";

export default class HomePage {
  async render() {
    return `
      <section class="container home-layout">
        <div class="map-section">
          <h2>Peta Sebaran Cerita</h2>
          <div id="map" class="map-container" tabindex="0" aria-label="Peta interaktif sebaran cerita"></div>
        </div>
        <div class="list-section">
          <h2>Daftar Cerita</h2>
          <div id="story-list" class="story-grid"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const map = L.map("map").setView([-6.2, 106.816666], 5);

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

    osmLayer.addTo(map);
    L.control
      .layers({ "Peta Jalan (OSM)": osmLayer, Topografi: topoLayer })
      .addTo(map);

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    try {
      const response = await Api.getStories();
      const listContainer = document.getElementById("story-list");
      listContainer.innerHTML = "";

      response.listStory.forEach((story) => {
        let marker = null;

        if (story.lat && story.lon) {
          marker = L.marker([story.lat, story.lon]).addTo(map);
          marker.bindPopup(`
            <div style="text-align: center;">
              <img src="${story.photoUrl}" alt="Foto ${story.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
              <br><strong>${story.name}</strong>
            </div>
          `);
        }

        const card = document.createElement("div");
        card.className = "story-card";
        card.tabIndex = 0;
        card.setAttribute("aria-label", `Cerita dari ${story.name}`);
        card.innerHTML = `
          <img src="${story.photoUrl}" alt="Foto cerita dari ${story.name}">
          <h3>${story.name}</h3>
          <p>${story.description.substring(0, 60)}...</p>
        `;

        card.addEventListener("click", () => {
          if (marker) {
            map.flyTo([story.lat, story.lon], 12);
            marker.openPopup();
          }
        });

        card.addEventListener("keypress", (e) => {
          if (e.key === "Enter") card.click();
        });

        listContainer.appendChild(card);
      });
    } catch (error) {
      document.getElementById("story-list").innerHTML =
        "<p>Gagal memuat cerita.</p>";
    }
  }
}
