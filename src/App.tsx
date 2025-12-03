import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import { AdminLayout } from "@/components/layout/AdminLayout";
import { CandidateLayout } from "@/components/layout/CandidateLayout";

// Auth Pages
import Login from "@/pages/Login";
import CandidateLogin from "@/pages/CandidateLogin";

// Admin Pages
import Dashboard from "@/pages/admin/Dashboard";
import TestLibrary from "@/pages/admin/TestLibrary";
import TestDetails from "@/pages/admin/TestDetails";
import TestCreate from "@/pages/admin/TestCreate";
import Assignments from "@/pages/admin/Assignments";
import Reports from "@/pages/admin/Reports";
import ReportDetails from "@/pages/admin/ReportDetails";
import Settings from "@/pages/admin/Settings";

// Candidate Pages
import CandidateTests from "@/pages/candidate/CandidateTests";
import CandidateCompleted from "@/pages/candidate/CandidateCompleted";
import TestInstructions from "@/pages/candidate/TestInstructions";
import TestTaking from "@/pages/candidate/TestTaking";
import TestSubmitted from "@/pages/candidate/TestSubmitted";
import CandidateReport from "@/pages/candidate/CandidateReport";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/candidate/login" element={<CandidateLogin />} />

          {/* Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tests" element={<TestLibrary />} />
            <Route path="/tests/create" element={<TestCreate />} />
            <Route path="/tests/:testId" element={<TestDetails />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/:assignmentId" element={<ReportDetails />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Candidate Routes */}
          <Route element={<CandidateLayout />}>
            <Route path="/candidate/tests" element={<CandidateTests />} />
            <Route path="/candidate/completed" element={<CandidateCompleted />} />
            <Route path="/candidate/test/:assignmentId/start" element={<TestInstructions />} />
            <Route path="/candidate/test/:assignmentId/submitted" element={<TestSubmitted />} />
            <Route path="/candidate/report/:assignmentId" element={<CandidateReport />} />
          </Route>

          {/* Test Taking - Full Screen (No Layout) */}
          <Route path="/candidate/test/:assignmentId" element={<TestTaking />} />

          {/* Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
