import { ThemeProvider } from "./context/ThemeContext.jsx";
import AppShell from "./components/layout/AppShell.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}
