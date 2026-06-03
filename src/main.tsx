
  import { createRoot } from "react-dom/client";
  import App from "./App.js";
  import { runDataCleanup } from "./app/cleanup.js";
  import "./styles/index.css";

  // 앱 렌더 전에 잔여 데이터(예: 이영희)를 localStorage에서 1회 정리한다.
  runDataCleanup();

  createRoot(document.getElementById("root")!).render(<App />);
