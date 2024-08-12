import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import HomePage from "./Components/Homepage/Homepage";
import Editor from "./Components/Editor/Editor";
import BottomBar from "./Components/BottomBar/BottomBar";

export default function App() {
  return (
    <>

      <div className="App">

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/room/:roomName" element={<Editor />} />
        </Routes>

        <BottomBar />

      </div>

    </>
  );
}
