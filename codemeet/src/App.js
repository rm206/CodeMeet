import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import HomePage from "./Components/Homepage/Homepage";
import Editor from "./Components/Editor/Editor";

export default function App() {
  return (
    <>
      <div className="app-container">
        <div className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/room/:roomName" element={<Editor />} />
          </Routes>
        </div>
      </div>
    </>
  );
}
