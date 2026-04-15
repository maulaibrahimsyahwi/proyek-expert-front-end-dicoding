import Api from "../../data/api";

export default class RegisterPage {
  async render() {
    return `
      <section class="container" style="max-width: 400px; margin-top: 50px;">
        <h1>Daftar Akun StoryApp</h1>
        <form id="register-form">
          <div class="form-group">
            <label for="name">Nama</label>
            <input type="text" id="name" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required minlength="8">
          </div>
          <button type="submit" class="btn" id="register-btn" style="width: 100%;">Daftar</button>
        </form>
        <p style="margin-top: 15px; text-align: center;">
          Sudah punya akun? <a href="#/login">Masuk di sini</a>
        </p>
      </section>
    `;
  }

  async afterRender() {
    document
      .getElementById("register-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const btn = document.getElementById("register-btn");

        btn.disabled = true;
        btn.innerText = "Memproses...";

        try {
          const response = await Api.register(name, email, password);
          if (!response.error) {
            alert("Registrasi berhasil! Silakan masuk.");
            window.location.hash = "#/login";
          } else {
            alert(response.message);
          }
        } catch (err) {
          alert("Gagal terhubung ke server");
        } finally {
          btn.disabled = false;
          btn.innerText = "Daftar";
        }
      });
  }
}
