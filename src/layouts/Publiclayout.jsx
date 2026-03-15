import Navbar from "../public/Navbar";
import WhatsApp from "../public/WhatsApp";
import { Outlet } from "react-router-dom";
import ScrollToHash from "../components/ScrollToHash";

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <ScrollToHash />
      <Outlet />
      <WhatsApp />
    </>
  );
}
