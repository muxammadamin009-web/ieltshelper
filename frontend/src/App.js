import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import ScrollToHash from './components/ScrollToHash';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TestPage from './pages/TestPage';
import Profile from './pages/Profile';
import Study from './pages/Study';
import Translator from './pages/Translator';
import AttemptReview from './pages/AttemptReview';
import WritingTasks from './pages/writing/WritingTasks';
import WritingTaskPage from './pages/writing/WritingTaskPage';
import WritingSubmissions from './pages/writing/WritingSubmissions';
import AdminDashboard from './pages/admin/AdminDashboard';
import PassageForm from './pages/admin/PassageForm';
import BulkImport from './pages/admin/BulkImport';
import StudyAdmin from './pages/admin/StudyAdmin';
import WritingAdmin from './pages/admin/WritingAdmin';
import UsersAdmin from './pages/admin/UsersAdmin';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToHash />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/test/:id"
              element={
                <PrivateRoute>
                  <TestPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/study"
              element={
                <PrivateRoute>
                  <Study />
                </PrivateRoute>
              }
            />
            <Route
              path="/translator"
              element={
                <PrivateRoute>
                  <Translator />
                </PrivateRoute>
              }
            />
            <Route
              path="/attempts/:id/review"
              element={
                <PrivateRoute>
                  <AttemptReview />
                </PrivateRoute>
              }
            />
            <Route
              path="/writing"
              element={
                <PrivateRoute>
                  <WritingTasks />
                </PrivateRoute>
              }
            />
            <Route
              path="/writing/submissions"
              element={
                <PrivateRoute>
                  <WritingSubmissions />
                </PrivateRoute>
              }
            />
            <Route
              path="/writing/:id"
              element={
                <PrivateRoute>
                  <WritingTaskPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/new"
              element={
                <AdminRoute>
                  <PassageForm />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/edit/:id"
              element={
                <AdminRoute>
                  <PassageForm />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/import"
              element={
                <AdminRoute>
                  <BulkImport />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/study"
              element={
                <AdminRoute>
                  <StudyAdmin />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/writing"
              element={
                <AdminRoute>
                  <WritingAdmin />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <UsersAdmin />
                </AdminRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

