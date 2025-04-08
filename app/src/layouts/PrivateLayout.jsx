import { Navigate, Outlet } from "react-router";
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";

export default function PrivateLayout() {
  const accessToken = localStorage.getItem("access_token");

  if (accessToken) {
    return (
      <div>
        <Navbar />
        <Toaster />
        <Outlet />
      </div>
    );
  }

  return <Navigate to={"/public"} />;
}
