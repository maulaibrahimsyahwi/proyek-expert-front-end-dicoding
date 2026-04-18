import L from "leaflet";
import Api from "../../data/api";

export default class AddPage {
  #mediaStream = null;
  #map = null;

  async render() {
    return `
      <section class="container" style="max-width: 800px;">
        <h1>Tambah Cerita Baru</h1>
        <form id="add-form">
          <div class="form-group" id="media-selection-container">
            <label style="font-size: 1.1rem; border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 16px;">
              <i class="fa-solid fa-image"></i> 1. Pilih Foto
            </label>
            <div class="file-upload-box">
              <div>
                <label for="file-upload" style="font-weight: normal; color: var(--text-muted); margin-bottom: 8px; display: block;">Unggah dari Perangkat</label>
                <input type="file" id="file-upload" accept="image/*" style="padding: 10px !important;">
              </div>
              <div style="text-align: center; color: var(--text-muted); font-weight: 600; font-size: 0.9rem;">ATAU</div>
              <div>
                <button type="button" id="start-camera-btn" class="btn btn-outline" style="width: 100%;">
                  <i class="fa-solid fa-camera"></i> Buka Kamera Langsung
                </button>
              </div>
            </div>
          </div>

          <div id="camera-container" class="form-group" style="display: none; padding: 16px; border-radius: var(--radius-md); background: #0f172a;">
            <video id="camera-view" autoplay playsinline style="width: 100%; max-height: 400px; border-radius: 8px; object-fit: cover;"></video>
            <canvas id="camera-canvas" style="display:none;"></canvas>
            <button type="button" id="capture-btn" class="btn btn-success" style="width: 100%; margin-top: 16px;">
              <i class="fa-solid fa-camera-retro"></i> Ambil Foto Ini
            </button>
            <button type="button" id="stop-camera-btn" class="btn btn-danger" style="width: 100%; margin-top: 8px;">
              <i class="fa-solid fa-xmark"></i> Batal / Tutup Kamera
            </button>
          </div>

          <div id="preview-container" class="form-group" style="display: none;">
            <label><i class="fa-solid fa-eye"></i> Pratinjau Foto</label>
            <img id="photo-preview" alt="Pratinjau foto" style="width:100%; max-height: 400px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--border);">
            <button type="button" id="reset-photo-btn" class="btn btn-danger" style="width: 100%; margin-top: 12px;">
              <i class="fa-solid fa-trash-can-arrow-up"></i> Hapus / Ganti Foto
            </button>
          </div>
          
          <div class="form-group" style="margin-top: 32px;">
            <label for="description" style="font-size: 1.1rem; border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 16px;">
              <i class="fa-solid fa-file-lines"></i> 2. Deskripsi Cerita
            </label>
            <textarea id="description" rows="5" required aria-required="true" placeholder="Ceritakan sesuatu tentang foto ini..."></textarea>
          </div>

          <div class="form-group" style="margin-top: 32px;">
            <label style="font-size: 1.1rem; border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 16px;">
              <i class="fa-solid fa-location-dot"></i> 3. Lokasi (Opsional)
            </label>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 12px;">Klik pada peta untuk menyematkan lokasi cerita Anda.</p>
            <div id="location-map" class="map-container" tabindex="0" aria-label="Peta pemilihan lokasi cerita" style="height: 300px; cursor: crosshair;"></div>
            <input type="hidden" id="lat">
            <input type="hidden" id="lon">
          </div>

          <button type="submit" class="btn" id="submit-btn" style="width: 100%; padding: 16px !important; font-size: 1.1rem; margin-top: 24px;">
            <i class="fa-solid fa-paper-plane"></i> Kirim Cerita Sekarang
          </button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const mediaSelectionContainer = document.getElementById(
      "media-selection-container",
    );
    const cameraContainer = document.getElementById("camera-container");
    const previewContainer = document.getElementById("preview-container");
    const startCameraBtn = document.getElementById("start-camera-btn");
    const stopCameraBtn = document.getElementById("stop-camera-btn");
    const video = document.getElementById("camera-view");
    const canvas = document.getElementById("camera-canvas");
    const captureBtn = document.getElementById("capture-btn");
    const fileUpload = document.getElementById("file-upload");
    const photoPreview = document.getElementById("photo-preview");
    const resetPhotoBtn = document.getElementById("reset-photo-btn");

    let photoBlob = null;

    startCameraBtn.addEventListener("click", async () => {
      try {
        this.#mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        video.srcObject = this.#mediaStream;
        mediaSelectionContainer.style.display = "none";
        cameraContainer.style.display = "block";
      } catch (err) {
        alert("Kamera tidak dapat diakses atau izin ditolak.");
      }
    });

    const stopCamera = () => {
      if (this.#mediaStream) {
        this.#mediaStream.getTracks().forEach((track) => track.stop());
        this.#mediaStream = null;
      }
    };

    stopCameraBtn.addEventListener("click", () => {
      stopCamera();
      cameraContainer.style.display = "none";
      mediaSelectionContainer.style.display = "block";
    });

    captureBtn.addEventListener("click", () => {
      if (!this.#mediaStream) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      canvas.toBlob(
        (blob) => {
          photoBlob = blob;
          photoPreview.src = URL.createObjectURL(blob);
          stopCamera();
          cameraContainer.style.display = "none";
          previewContainer.style.display = "block";
          fileUpload.value = "";
        },
        "image/jpeg",
        0.8,
      );
    });

    fileUpload.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        photoBlob = null;
        photoPreview.src = URL.createObjectURL(e.target.files[0]);
        mediaSelectionContainer.style.display = "none";
        previewContainer.style.display = "block";
      }
    });

    resetPhotoBtn.addEventListener("click", () => {
      photoBlob = null;
      fileUpload.value = "";
      photoPreview.src = "";
      previewContainer.style.display = "none";
      mediaSelectionContainer.style.display = "block";
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
        let fileToUpload = null;
        if (fileUpload.files && fileUpload.files.length > 0) {
          fileToUpload = fileUpload.files[0];
        } else if (photoBlob) {
          fileToUpload = new File([photoBlob], "story-photo.jpg", {
            type: "image/jpeg",
          });
        }

        if (!fileToUpload) {
          alert(
            "Silakan pilih file atau ambil foto menggunakan kamera terlebih dahulu.",
          );
          return;
        }

        const btn = document.getElementById("submit-btn");
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-rotate fa-spin"></i> Mengirim Data...`;

        const data = {
          description: document.getElementById("description").value,
          photo: fileToUpload,
          lat: document.getElementById("lat").value,
          lon: document.getElementById("lon").value,
        };

        try {
          if (!navigator.onLine) {
            const { idb, STORE_SYNC } = await import("../../data/idb");
            const token = localStorage.getItem("token");
            await idb.put(STORE_SYNC, {
              id: Date.now().toString(),
              description: data.description,
              photo: fileToUpload,
              lat: data.lat,
              lon: data.lon,
              token: token,
            });
            const registration = await navigator.serviceWorker.ready;
            if (registration.sync) {
              await registration.sync.register("sync-new-story");
            }
            alert(
              "Anda sedang offline. Cerita disimpan dan akan dikirim otomatis saat jaringan kembali tersedia.",
            );
            window.location.hash = "#/";
            return;
          }

          const response = await Api.addStory(data);
          if (!response.error) {
            if (Notification.permission === "granted") {
              const reg = await navigator.serviceWorker.ready;
              reg.showNotification("StoryApp", {
                body: "Cerita baru Anda berhasil dikirim!",
                icon: "/favicon.png",
              });
            }
            window.location.hash = "#/";
          } else {
            alert(response.message);
          }
        } catch (err) {
          alert("Gagal mengirim cerita ke server.");
        } finally {
          btn.disabled = false;
          btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Kirim Cerita Sekarang`;
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
