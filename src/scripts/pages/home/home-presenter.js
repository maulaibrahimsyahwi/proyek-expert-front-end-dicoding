import Api from "../../data/api";

class HomePresenter {
  constructor({ view }) {
    this._view = view;
  }

  async getAllStories() {
    try {
      const response = await Api.getStories();
      if (!response.error) {
        this._view.showStories(response.listStory);
      } else {
        this._view.showErrorMessage();
      }
    } catch (error) {
      this._view.showErrorMessage();
    }
  }
}

export default HomePresenter;
