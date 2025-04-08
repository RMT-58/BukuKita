import { Navigate, Outlet } from "react-router";
import PublicNavbar from "../components/PublicNavbar";
import { Toaster } from "react-hot-toast";

export default function PublicLayout() {
  const accessToken = localStorage.getItem("access_token");

  if (accessToken) {
    return <Navigate to={"/"} />;
  }

  return (
    <div>
      <PublicNavbar />
      <Toaster />
      <Outlet />
    </div>
  );
}
