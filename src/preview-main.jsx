import React from "react";
import ReactDOM from "react-dom/client";
import Preview from "./pages/Preview.jsx"; // halaman PDF kamu

// ⛔ Tidak ada import Tailwind di sini!
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Preview />
  </React.StrictMode>
);
