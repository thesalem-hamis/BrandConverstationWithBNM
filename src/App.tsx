import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import RegistrationPage from "./pages/RegistrationPage";
import RegistrationSuccessPage from "./pages/RegistrationSuccessPage";
import RequestAnswersPage from "./pages/RequestAnswersPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegistrationPage />} />
        <Route path="/registration-success" element={<RegistrationSuccessPage />} />
        <Route path="/request-answers" element={<RequestAnswersPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
