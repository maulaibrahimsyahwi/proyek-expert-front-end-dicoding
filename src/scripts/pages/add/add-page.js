import L from "leaflet";
import Api from "../../data/api";

export default class AddPage {
  #mediaStream = null;
  #map = null;

  async render() {
    return `
      <section class="container">
        <h2>Tambah Cerita Baru</h2>
        <form id="add-form">
          <div class="form-group">
            <label>Foto Cerita (Kamera Langsung)</label>
            <video id="camera-view" autoplay playsinline aria-label="Tampilan Kamera" style="width: 100%; border-radius: 8px; background: #000; height: 300px; object-fit: cover;"></video>
            <canvas id="camera-canvas" style="display:none;"></canvas>
            <button type="button" id="capture-btn" class="btn" style="margin-top:10px;">Ambil Foto</button>
            <img id="photo-preview" alt="Pratinjau foto" style="display:none; width:100%; max-height: 300px; object-fit: cover; border-radius:8px; margin-top:10px;">
          </div>
          
          <div class="form-group">
            <label for="description">Deskripsi Cerita</label>
            <textarea id="description" rows="4" required aria-required="true" style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid #ccc;"></textarea>
          </div>

          <div class="form-group">
            <label>Pilih Lokasi di Peta</label>
            <div id="location-map" class="map-container" tabindex="0" aria-label="Peta pemilihan lokasi cerita"></div>
            <input type="hidden" id="lat">
            <input type="hidden" id="lon">
          </div>

          <button type="submit" class="btn" id="submit-btn" style="width: 100%; padding: 12px; font-size: 16px;">Kirim Cerita</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const video = document.getElementById("camera-view");
    const canvas = document.getElementById("camera-canvas");
    const photoPreview = document.getElementById("photo-preview");
    const captureBtn = document.getElementById("capture-btn");
    let photoBlob = null;

    try {
      this.#mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      video.srcObject = this.#mediaStream;
    } catch (err) {
      alert("Kamera tidak dapat diakses.");
    }

    captureBtn.addEventListener("click", () => {
      if (!this.#mediaStream) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);

      canvas.toBlob(
        (blob) => {
          photoBlob = blob;
          photoPreview.src = URL.createObjectURL(blob);
          photoPreview.style.display = "block";
          video.style.display = "none";
          captureBtn.style.display = "none";
        },
        "image/jpeg",
        0.8,
      );
    });

    this.#map = L.map("location-map").setView([-6.2, 106.816666], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(this.#map);
    let marker = null;

    this.#map.on("click", (e) => {
      document.getElementById("lat").value = e.latlng.lat;
      document.getElementById("lon").value = e.latlng.lng;

      if (marker) this.#map.removeLayer(marker);
      marker = L.marker(e.latlng).addTo(this.#map);
    });

    setTimeout(() => {
      this.#map.invalidateSize();
    }, 100);

    document
      .getElementById("add-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!photoBlob) {
          alert("Silakan ambil foto menggunakan kamera terlebih dahulu.");
          return;
        }

        const btn = document.getElementById("submit-btn");
        btn.disabled = true;
        btn.innerText = "Mengirim Data...";

        const file = new File([photoBlob], "story-photo.jpg", {
          type: "image/jpeg",
        });

        const data = {
          description: document.getElementById("description").value,
          photo: file,
          lat: document.getElementById("lat").value,
          lon: document.getElementById("lon").value,
        };

        try {
          const response = await Api.addStory(data);
          if (!response.error) {
            window.location.hash = "#/";
          } else {
            alert(response.message);
          }
        } catch (err) {
          alert("Gagal mengirim cerita ke server.");
        } finally {
          btn.disabled = false;
          btn.innerText = "Kirim Cerita";
        }
      });
  }

  async beforeUnload() {
    if (this.#mediaStream) {
      this.#mediaStream.getTracks().forEach((track) => track.stop());
    }
    if (this.#map) {
      this.#map.remove();
    }
  }
}
