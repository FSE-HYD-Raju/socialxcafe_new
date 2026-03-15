import { createBrowserRouter } from "react-router-dom";

import Navbar from "./pages/public/Navbar";
import Hero from "./pages/public/Hero";
import About from "./pages/public/About";
import Events from "./pages/public/Events";
import Gallery from "./pages/public/Gallery";
import Visit from "./pages/public/Visit";
import TheSpace from "./pages/public/TheSpace";
import WhatsApp from "./pages/public/WhatsApp";

import Login from "./auth/Login";
import RoleGuard from "./auth/RoleGuard";

import Dashboard from "./pages/admin/Dashboard";
import Menu from "./pages/admin/Menu";
import Customers from "./pages/admin/Customers";
import Orders from "./pages/admin/Orders";
import AdminEvents from "./pages/admin/AdminEvents";

import AdminLayout from "./layouts/AdminLayout";
import OrganizerLayout from "./layouts/OrganizerLayout";

import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import OrganizerEvents from "./pages/organizer/OrganizerEvents";
import EventRegistrations from "./pages/organizer/EventRegistrations.jsx";

import ScrollToHash from "./components/common/ScrollToHash";

import EventDetail from "./features/events/EventDetail";
import Users from "./pages/admin/Users.jsx";

function HomePage() {
  return (
    <>
      <ScrollToHash />
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

export const router = createBrowserRouter([
  /*
  PUBLIC WEBSITE
  */

  {
    path: "/",
    element: <HomePage />,
  },

  {
    path: "/events/:slug",
    element: <EventDetail />,
  },

  /* LOGIN
   */

  {
    path: "/admin/login",
    element: <Login />,
  },

  {
    path: "/organizer/login",
    element: <Login />,
  },

  /*
  ADMIN PANEL
  */

  {
    path: "/admin",
    element: (
      <RoleGuard roles={["admin", "staff"]}>
        <AdminLayout />
      </RoleGuard>
    ),
    children: [
      {
        path: "dashboard",
        element: (
          <RoleGuard roles={["admin"]}>
            <Dashboard />
          </RoleGuard>
        ),
      },

      {
        path: "orders",
        element: (
          <RoleGuard roles={["admin", "staff"]}>
            <Orders />
          </RoleGuard>
        ),
      },

      {
        path: "menu",
        element: (
          <RoleGuard roles={["admin", "staff"]}>
            <Menu />
          </RoleGuard>
        ),
      },

      {
        path: "events",
        element: (
          <RoleGuard roles={["admin", "staff"]}>
            <AdminEvents />
          </RoleGuard>
        ),
      },

      {
        path: "customers",
        element: (
          <RoleGuard roles={["admin"]}>
            <Customers />
          </RoleGuard>
        ),
      },
      {
        path: "users",
        element: (
          <RoleGuard roles={["admin"]}>
            <Users />
          </RoleGuard>
        ),
      },
    ],
  },

  /*
  ORGANIZER PANEL
  */

  {
    path: "/organizer",
    element: (
      <RoleGuard roles={["eventOrganizer"]}>
        <OrganizerLayout />
      </RoleGuard>
    ),
    children: [
      {
        path: "dashboard",
        element: <OrganizerDashboard />,
      },

      {
        path: "events",
        element: <OrganizerEvents />,
      },

      {
        path: "events/:eventId/registrations",
        element: <EventRegistrations />,
      },
    ],
  },
]);
