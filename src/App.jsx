import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./microservices/supabaseClient";
import useDisableBackNavigation from "./microservices/useDisableBackNavigation";
import useDisableDevTools from "./microservices/disableDevTools"; 


import Main from "./Website/Main/Main";
import Selection from "./System/Selection/Selection";

import POS from "./System/POS/POS";
import Inventory from "./System/Inventory/Inventory";
import Dashboard from "./System/Dashboard/Dashboard";

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Disable DevTools globally ---
  useDisableDevTools();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <Router>
      <Routes>
        {/* 🌐 Public Website */}
        <Route
          path="/"
          element={
            <>
              <Main />
            </>
          }
        />

        {/* 💳 Cashier - POS System */}
        <Route
          path="/pos"
          element={
            <ProtectedRoute session={session} allowedRole="Manager">
              <POS />
            </ProtectedRoute>
          }
        />

        {/* 📦 Manager - Inventory System */}
        <Route
          path="/inventory"
          element={
            <ProtectedRoute session={session} allowedRole="Manager">
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute session={session} allowedRole="Manager">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/selection"
          element={
            <ProtectedRoute session={session} allowedRole="Manager">
              <Selection />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
};

// ✅ Protect routes and disable back navigation
const ProtectedRoute = ({ session, allowedRole, children }) => {
  const isProtected = !!session;
  useDisableBackNavigation(isProtected); // prevents using browser back on protected routes

  if (!session) {
    console.log("No active session — redirecting to /");
    return <Navigate to="/" replace />;
  }

  const role = session.user?.user_metadata?.role;
  console.log("User role:", role, "Allowed:", allowedRole);

  if (allowedRole && role !== allowedRole) {
    console.warn("Unauthorized role, sending home");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default App;
