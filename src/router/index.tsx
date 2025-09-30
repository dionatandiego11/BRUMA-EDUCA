import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import AdminPage from '../pages/AdminPage';
import CreateProvaoPage from '../pages/CreateProvaoPage';
import InsertDataPage from '../pages/InsertDataPage';
import ResultsPage from '../pages/ResultsPage';
import LoginPage from '../pages/LoginPage'; // This will be created later
import { ProtectedRoute } from './ProtectedRoute'; // This will be created later

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/create-provao',
    element: (
      <ProtectedRoute>
        <CreateProvaoPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/insert',
    element: (
      <ProtectedRoute>
        <InsertDataPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/results',
    element: (
      <ProtectedRoute>
        <ResultsPage />
      </ProtectedRoute>
    ),
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;