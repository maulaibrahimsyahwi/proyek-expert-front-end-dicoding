import Api from "../../data/api";

export default class LoginPage {
  async render() {
    return `
      <section class="container">
        <h2>Masuk ke Story App</h2>
        <form id="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid #ccc;">
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required minlength="8" style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid #ccc;">
          </div>
          <button type="submit" class="btn" id="login-btn" style="width: 100%; padding: 12px; font-size: 16px; margin-top: 10px;">Masuk</button>
        </form>
        <p style="text-align: center; margin-top: 15px;">
          Belum punya akun? <a href="#/register">Daftar di sini</a>
        </p>
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
            localStorage.setItem("name", response.loginResult.name);
            window.location.hash = "#/";
          } else {
            alert(response.message);
          }
        } catch (error) {
          alert("Gagal melakukan login. Periksa koneksi Anda.");
        } finally {
          btn.disabled = false;
          btn.innerText = "Masuk";
        }
      });
  }
}
