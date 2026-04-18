import { idb, STORE_FAVORITE } from "../../data/idb";
import { showFormattedDate } from "../../utils/index";

export default class FavoritePage {
  async render() {
    return `
      <div class="container">
        <h1><i class="fa-solid fa-heart" style="font-size: 28px; color: #ef4444;"></i> Cerita Favorit</h1>
        <div class="form-group" style="margin-bottom: 32px;">
          <input type="text" id="search-favorite" placeholder="Cari cerita favorit..." aria-label="Cari cerita favorit">
        </div>
        <div id="favorite-list" class="story-grid"></div>
      </div>
    `;
  }

  async afterRender() {
    const stories = await idb.getAll(STORE_FAVORITE);
    this.allStories = stories;
    this.renderList(stories);

    document
      .getElementById("search-favorite")
      .addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = this.allStories.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.description.toLowerCase().includes(query),
        );
        this.renderList(filtered);
      });
  }

  renderList(stories) {
    const listContainer = document.getElementById("favorite-list");
    listContainer.innerHTML = "";
    if (stories.length === 0) {
      listContainer.innerHTML = `<p style="color: var(--text-muted); display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-box-open"></i> Tidak ada cerita favorit yang ditemukan.</p>`;
      return;
    }

    stories.forEach((story) => {
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
          <button class="btn btn-danger btn-delete-fav" data-id="${story.id}" style="width: 100%;">
            <i class="fa-solid fa-trash"></i> Hapus Favorit
          </button>
        </div>
      `;
      listContainer.appendChild(card);
    });

    document.querySelectorAll(".btn-delete-fav").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.getAttribute("data-id");
        await idb.delete(STORE_FAVORITE, id);
        this.allStories = this.allStories.filter((s) => s.id !== id);
        this.renderList(this.allStories);
      });
    });
  }
}
