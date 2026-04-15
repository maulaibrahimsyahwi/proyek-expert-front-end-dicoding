import Api from "../../data/api";

export default class LoginPage {
  async render() {
    return `
      <section class="container" style="max-width: 400px; margin-top: 50px;">
        <h2>Masuk ke StoryApp</h2>
        <form id="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required minlength="8">
          </div>
          <button type="submit" class="btn" id="login-btn" style="width: 100%;">Masuk</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    document
      .getElementById("login-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const btn = document.getElementById("login-btn");

        btn.disabled = true;
        btn.innerText = "Memproses...";

        try {
          const response = await Api.login(email, password);
          if (!response.error) {
            localStorage.setItem("token", response.loginResult.token);
            window.location.hash = "#/";
          } else {
            alert(response.message);
          }
        } catch (err) {
          alert("Gagal terhubung ke server");
        } finally {
          btn.disabled = false;
          btn.innerText = "Masuk";
        }
      });
  }
}
