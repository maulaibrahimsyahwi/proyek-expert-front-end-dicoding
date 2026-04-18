import HomePage from "../pages/home/home-page";
import AddPage from "../pages/add/add-page";
import LoginPage from "../pages/auth/login-page";
import RegisterPage from "../pages/auth/register-page";
import FavoritePage from "../pages/favorite/favorite-page";

const routes = {
  "/": new HomePage(),
  "/add": new AddPage(),
  "/login": new LoginPage(),
  "/register": new RegisterPage(),
  "/favorite": new FavoritePage(),
};

export default routes;
