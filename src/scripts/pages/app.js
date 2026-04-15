import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #currentPage = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#setupDrawer();
    this.#setupLogout();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }
    });
  }

  #setupLogout() {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.hash = "#/login";
      });
    }
  }

  async renderPage() {
    let url = getActiveRoute();
    const token = localStorage.getItem("token");

    if (!token && url !== "/login" && url !== "/register") {
      window.location.hash = "#/login";
      return;
    }

    if (token && url === "/login") {
      window.location.hash = "#/";
      return;
    }

    const page = routes[url] || routes["/"];

    if (
      this.#currentPage &&
      typeof this.#currentPage.beforeUnload === "function"
    ) {
      await this.#currentPage.beforeUnload();
    }

    this.#currentPage = page;
    const pageHtml = await page.render();

    if (!document.startViewTransition) {
      this.#content.innerHTML = pageHtml;
      await page.afterRender();
      return;
    }

    const transition = document.startViewTransition(() => {
      this.#content.innerHTML = pageHtml;
    });

    await transition.ready;
    await page.afterRender();
  }
}

export default App;
