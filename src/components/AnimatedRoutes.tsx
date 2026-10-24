import { AnimatePresence } from "framer-motion";
import { useLocation, Routes, Route } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Reflect from "@/pages/Reflect";
import Wrapped from "@/pages/Wrapped";
import Blueprint from "@/pages/Blueprint";
import GoalsDashboard from "@/pages/GoalsDashboard";
import NotFound from "@/pages/NotFound";
import ScreenshotShowcase from "@/pages/ScreenshotShowcase";

export const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Index />
            </PageTransition>
          }
        />
        <Route
          path="/auth"
          element={
            <PageTransition>
              <Auth />
            </PageTransition>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PageTransition>
              <Dashboard />
            </PageTransition>
          }
        />
        <Route
          path="/reflect"
          element={
            <PageTransition>
              <Reflect />
            </PageTransition>
          }
        />
        <Route
          path="/wrapped"
          element={
            <PageTransition>
              <Wrapped />
            </PageTransition>
          }
        />
        <Route
          path="/blueprint"
          element={
            <PageTransition>
              <Blueprint />
            </PageTransition>
          }
        />
        <Route
          path="/goals"
          element={
            <PageTransition>
              <GoalsDashboard />
            </PageTransition>
          }
        />
        <Route
          path="/snaps"
          element={
            <PageTransition>
              <ScreenshotShowcase />
            </PageTransition>
          }
        />
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};
