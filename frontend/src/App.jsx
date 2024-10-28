import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import Resume from "./components/Resume";

function App() {
  const [result, setResult] = useState({});

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home setResult={setResult} />} />
          <Route path="/resume" element={<Resume result={result} />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
