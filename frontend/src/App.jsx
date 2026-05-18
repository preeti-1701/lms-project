import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import StudentDashboard from "./pages/StudentDashboard";

function App() {

  useEffect(()=>{

    const disableRightClick=(e)=>{
      e.preventDefault();

      alert(
        "Right click disabled for content protection"
      );
    };

    document.addEventListener(
      "contextmenu",
      disableRightClick
    );

    return ()=>{

      document.removeEventListener(
        "contextmenu",
        disableRightClick
      );

    };

  },[]);


  return(

<BrowserRouter>

<Routes>

<Route
path="/"
element={<Login/>}
/>

<Route
path="/admin"
element={<AdminDashboard/>}
/>

<Route
path="/trainer"
element={<TrainerDashboard/>}
/>

<Route
path="/student"
element={<StudentDashboard/>}
/>

</Routes>

</BrowserRouter>

  );

}

export default App;