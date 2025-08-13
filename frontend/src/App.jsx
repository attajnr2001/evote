import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Welcome from "./pages/Welcome";
import AdminLogin from "./admin/pages/AdminLogin";
import StudentLogin from "./student/pages/StudentLogin";
import Vote from "./student/pages/Vote";
import Dashboard from "./admin/pages/Dashboard";
import AddCandidate from "./admin/pages/AddCandidate";
import ViewResults from "./admin/pages/ViewResults";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="" element={<Welcome />} />
      <Route path="admin-login" element={<AdminLogin />} />
      <Route path="student-login" element={<StudentLogin />} />
      <Route path="student-vote" element={<Vote />} />
      <Route path="admin-dashboard" element={<Dashboard />} />
      <Route path="admin/add-candidate" element={<AddCandidate />} />
      <Route path="admin/view-results" element={<ViewResults />} />
    </Route>
  )
);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
