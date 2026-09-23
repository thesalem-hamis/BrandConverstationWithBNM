import { BrowserRouter, Routes, Route } from "react-router-dom";

import RegistrationPage from "./pages/RegistrationPage";
import RequestAnswersPage from "./pages/RequestAnswersPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegistrationPage />} />
        <Route path="/request-answers" element={<RequestAnswersPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
