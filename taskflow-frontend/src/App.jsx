import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import FirstLoginModal from './components/FirstLoginModal';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import ManagerLayout from './layouts/ManagerLayout';
import MemberLayout from './layouts/MemberLayout';
import ClientLayout from './layouts/ClientLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import RoleCategoriesPage from './pages/admin/RoleCategoriesPage';
import ClientsPage from './pages/admin/ClientsPage';
import AdminProjectsPage from './pages/admin/AdminProjectsPage';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerProjectsPage from './pages/manager/ManagerProjectsPage';
import ProjectDetailsPage from './pages/manager/ProjectDetailsPage';
import ManagerTasksPage from './pages/manager/ManagerTasksPage';
import ManagerKanbanPage from './pages/manager/ManagerKanbanPage';
import ManagerMilestonesPage from './pages/manager/ManagerMilestonesPage';
import ManagerBugsPage from './pages/manager/ManagerBugsPage';
import ManagerChangeRequestsPage from './pages/manager/ManagerChangeRequestsPage';
import ManagerDocumentsPage from './pages/manager/ManagerDocumentsPage';
import ManagerMessagesPage from './pages/manager/ManagerMessagesPage';
import MemberDashboard from './pages/member/MemberDashboard';
import MemberTasksPage from './pages/member/MemberTasksPage';
import MemberKanbanPage from './pages/member/MemberKanbanPage';
import MemberBugsPage from './pages/member/MemberBugsPage';
import MemberDocumentsPage from './pages/member/MemberDocumentsPage';
import MemberTimesheetsPage from './pages/member/MemberTimesheetsPage';
import ManagerTimesheetsPage from './pages/manager/ManagerTimesheetsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientProjectsPage from './pages/client/ClientProjectsPage';
import ClientChangeRequestsPage from './pages/client/ClientChangeRequestsPage';
import ClientDocumentsPage from './pages/client/ClientDocumentsPage';
import ClientMessagesPage from './pages/client/ClientMessagesPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <FirstLoginModal />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/:roleSlug" element={<LoginPage />} />

          {/* Admin Portal Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="roles" element={<RoleCategoriesPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="projects" element={<AdminProjectsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="audit" element={<AuditLogsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="*" element={<AdminDashboard />} />
          </Route>

          {/* Project Manager Portal Routes */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={['PROJECT_MANAGER']}>
                <ManagerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/manager/dashboard" replace />} />
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="projects" element={<ManagerProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailsPage />} />
            <Route path="tasks" element={<ManagerTasksPage />} />
            <Route path="kanban" element={<ManagerKanbanPage />} />
            <Route path="milestones" element={<ManagerMilestonesPage />} />
            <Route path="bugs" element={<ManagerBugsPage />} />
            <Route path="change-requests" element={<ManagerChangeRequestsPage />} />
            <Route path="documents" element={<ManagerDocumentsPage />} />
            <Route path="messages" element={<ManagerMessagesPage />} />
            <Route path="time-reports" element={<ManagerTimesheetsPage />} />
            <Route path="timesheets" element={<ManagerTimesheetsPage />} />
            <Route path="*" element={<ManagerDashboard />} />
          </Route>

          {/* Team Member Portal Routes */}
          <Route
            path="/member"
            element={
              <ProtectedRoute allowedRoles={['TEAM_MEMBER']}>
                <MemberLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/member/dashboard" replace />} />
            <Route path="dashboard" element={<MemberDashboard />} />
            <Route path="tasks" element={<MemberTasksPage />} />
            <Route path="kanban" element={<MemberKanbanPage />} />
            <Route path="bugs" element={<MemberBugsPage />} />
            <Route path="documents" element={<MemberDocumentsPage />} />
            <Route path="time-tracking" element={<MemberTimesheetsPage />} />
            <Route path="timesheets" element={<MemberTimesheetsPage />} />
            <Route path="*" element={<MemberDashboard />} />
          </Route>

          {/* Client Portal Routes */}
          <Route
            path="/client"
            element={
              <ProtectedRoute allowedRoles={['CLIENT']}>
                <ClientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/client/dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="projects" element={<ClientProjectsPage />} />
            <Route path="change-requests" element={<ClientChangeRequestsPage />} />
            <Route path="documents" element={<ClientDocumentsPage />} />
            <Route path="messages" element={<ClientMessagesPage />} />
            <Route path="*" element={<ClientDashboard />} />
          </Route>

          {/* 404 Catch All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
