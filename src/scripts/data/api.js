const BASE_URL = "https://story-api.dicoding.dev/v1";

class Api {
  static getAuthToken() {
    return localStorage.getItem("token");
  }

  static async login(email, password) {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  static async register(name, email, password) {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  }

  static async getStories() {
    const response = await fetch(`${BASE_URL}/stories?location=1`, {
      headers: { Authorization: `Bearer ${this.getAuthToken()}` },
    });
    return response.json();
  }

  static async addStory(data) {
    const formData = new FormData();
    formData.append("description", data.description);
    formData.append("photo", data.photo);
    if (data.lat && data.lon) {
      formData.append("lat", data.lat);
      formData.append("lon", data.lon);
    }

    const response = await fetch(`${BASE_URL}/stories`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.getAuthToken()}` },
      body: formData,
    });
    return response.json();
  }

  static async subscribePushNotification(subscription) {
    const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify(subscription),
    });
    return response.json();
  }

  static async unsubscribePushNotification(endpoint) {
    const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({ endpoint }),
    });
    return response.json();
  }
}

export default Api;
