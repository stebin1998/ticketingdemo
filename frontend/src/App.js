import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute, SellerRoute, GuestRoute } from './components/ProtectedRoutes';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SellerSignup from './pages/SellerSignup';
import UpgradeToSeller from './pages/UpgradeToSeller';
import Dashboard from './pages/Dashboard';

import CreateEventPage from './pages/CreateEvent';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import EventResults from './pages/EventResult';
import MyEvents from './pages/MyEvents';
import EditEvent from './pages/EditEvent';
import InviteEvent from './pages/InviteEvent';
import './index.css';

const pageVariants = {
  initial: { opacity: 0, x: 50 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -50 },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Dashboard />
            </motion.div>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestRoute>
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Signup />
              </motion.div>
            </GuestRoute>
          }
        />
        <Route
          path="/seller-signup"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <SellerSignup />
            </motion.div>
          }
        />
        <Route
          path="/upgrade-to-seller"
          element={
            <PrivateRoute>
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <UpgradeToSeller />
              </motion.div>
            </PrivateRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Login />
              </motion.div>
            </GuestRoute>
          }
        />
        <Route
          path="/createEvent"
          element={
            <SellerRoute>
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <CreateEventPage />
              </motion.div>
            </SellerRoute>
          }
        />
        <Route
          path="/create-event"
          element={
            <SellerRoute>
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <CreateEventPage />
              </motion.div>
            </SellerRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Dashboard />
            </motion.div>
          }
        />
        <Route
          path="/my-events"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <MyEvents />
            </motion.div>
          }
        />

        <Route
          path="/edit-event/:id"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <EditEvent />
            </motion.div>
          }
        />
        <Route
          path="/event-results/:eventId"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <EventResults />
            </motion.div>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Profile />
              </motion.div>
            </PrivateRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Cart />
              </motion.div>
            </PrivateRoute>
          }
        />
        <Route
          path="/invite/:token"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <InviteEvent />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
