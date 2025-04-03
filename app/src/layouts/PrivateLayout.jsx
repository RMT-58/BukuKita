import { Navigate, Outlet } from "react-router";
import Navbar from "../components/Navbar";

export default function PrivateLayout() {
  const accessToken = localStorage.getItem("access_token");

  if (accessToken) {
    return (
      <div>
        <Navbar />
        <Outlet />
      </div>
    );
  }

  return <Navigate to={"/public"} />;
}
