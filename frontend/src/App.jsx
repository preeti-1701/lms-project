import AppRouter from "./AppRouter";
import { AppProvider } from "./context/AppProvider";

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
