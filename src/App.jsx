import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Events from "./components/Events";
import Gallery from "./components/Gallery";
import Visit from "./components/Visit";
import WhatsApp from "./components/WhatsApp";
import TheSpace from "./components/TheSpace";
import AdminLogin from "./components/admin/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./components/admin/Dashboard";
import Menu from "./components/customer/Menu";
import Customers from "./components/admin/Customers";
import Orders from "./components/orders/Orders";
import MenuItems from "./components/menuItems/Menu";
import AdminEvents from "./components/events/AdminEvents";

function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <TheSpace />
      <Events />
      <Gallery />
      <Visit />
      <WhatsApp />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="customers" element={<Customers />} />
        <Route path="orders" element={<Orders />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="menu" element={<MenuItems />} />
        <Route path="events" element={<AdminEvents />} />
      </Route>
      <Route path="/customer/menu" element={<Menu />} />
    </Routes>
  );
}
