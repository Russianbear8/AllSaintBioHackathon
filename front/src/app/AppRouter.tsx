import { GraphPage } from "@/pages/GraphPage";
import { HomePage } from "@/pages/HomePage";
import { BrowserRouter, Route, Routes } from "react-router-dom";

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/graph" element={<GraphPage />} />
      </Routes>
    </BrowserRouter>
  );
};
