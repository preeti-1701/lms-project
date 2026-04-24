// // import { useState } from "react";
// // import API from "../services/api";

// // export default function Login() {
// //   const [form, setForm] = useState({
// //     username: "",
// //     password: "",
// //   });

// //   const handleLogin = async () => {
// //   try {
// //     const res = await API.post("/users/login/", form);

// //     console.log(res.data); // 👈 ADD THIS

// //     localStorage.setItem("token", res.data.access);

// //     window.location.href = "/dashboard";
// //   } catch (err) {
// //     console.log(err);
// //     alert("Login failed");
// //   }
// // };

// //   return (
// //     <div>
// //       <h2>Login</h2>

// //       <input placeholder="Username"
// //         onChange={(e) => setForm({...form, username: e.target.value})}
// //       />

// //       <input type="password" placeholder="Password"
// //         onChange={(e) => setForm({...form, password: e.target.value})}
// //       />

// //       <button onClick={handleLogin}>Login</button>
// //     </div>
// //   );
// // }

// import { useState } from "react";
// import API from "../services/api";
// import { Eye, EyeOff } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// export default function Login() {
//   const [form, setForm] = useState({
//     username: "",
//     password: "",
//   });
// const navigate = useNavigate();
//   const [showPassword, setShowPassword] = useState(false);

//   const handleLogin = async () => {
//   try {
//     const res = await API.post("/users/login/", {
//       username: form.username,
//       password: form.password,
//     });

//     console.log("LOGIN:", res.data);

//     // ✅ store tokens
//     localStorage.setItem("token", res.data.access);
//     localStorage.setItem("refresh", res.data.refresh);

//     navigate("/dashboard");

//   } catch (err) {
//     console.log(err.response?.data);
//     alert("Invalid credentials");
//   }
// };
// <div className="flex">
  
// </div>
//   return (
//     <div className="min-h-screen flex w-full">

//       {/* 🔷 LEFT SIDE (IMAGE + TEXT) */}
//       <div className="hidden md:flex w-1/2 relative scale-down">
//         <img
//           src="https://www.gyrus.com/wp-content/uploads/2024/07/2-2.webp"
//           alt="bg"
//           className="w-full h-full object-cover"
//         />

//         <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-10 text-white">
//           <h1 className="text-3xl font-bold mb-3">
//             Learn Smarter. Grow Faster.
//           </h1>
//           <h2 className="text-sm opacity-80">
//             Access courses anytime, anywhere with our LMS platform.
//           </h2>
//         </div>
//       </div>
// <div className="flex">

// </div>
//       {/* 🔶 RIGHT SIDE (LOGIN FORM) */}
//       <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-100">

//         <div className="bg-white p-8 rounded-2xl shadow-xl w-96">

//           <h2 className="text-2xl font-bold mb-6 text-gray-800">
//             Welcome Back 👋
//           </h2>

//           {/* USERNAME */}
//           <input
//             type="text"
//             placeholder="Username"
//             className="w-full border p-3 rounded mb-4 focus:ring-2 focus:ring-blue-400 outline-none"
//             onChange={(e) =>
//               setForm({ ...form, username: e.target.value })
//             }
//           />

//           {/* PASSWORD */}
//           <div className="relative mb-4">
//             <input
//               type={showPassword ? "text" : "password"}
//               placeholder="Password"
//               className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-400 outline-none"
//               onChange={(e) =>
//                 setForm({ ...form, password: e.target.value })
//               }
//             />

//             <button
//               type="button"
//               className="absolute right-3 top-3 text-gray-400"
//               onClick={() => setShowPassword(!showPassword)}
//             >
//               {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//             </button>
//           </div>

//           {/* REMEMBER + FORGOT */}
//           <div className="flex justify-between items-center text-sm mb-4">
//             <label className="flex items-center gap-2">
//               <input type="checkbox" />
//               Remember me
//             </label>
//             <span className="text-blue-500 cursor-pointer">
//               Forgot password?
//             </span>
//           </div>

//           {/* LOGIN BUTTON */}
//           <button
//             onClick={handleLogin}
//             className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
//           >
//             Login
//           </button>

//           {/* FOOTER */}
//           <p className="text-center text-sm text-gray-500 mt-5">
//             Don’t have an account?{" "}
//             <span className="text-blue-500 cursor-pointer">
//               Sign up
//             </span>
//           </p>

//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleLogin = async () => {
    try {
      const res = await API.post("/users/login/", {
        username: form.username,
        password: form.password,
      });

      console.log("LOGIN:", res.data);

      // ✅ Store JWT tokens
      localStorage.setItem("token", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("role", res.data.role);

      navigate("/dashboard");
    } catch (err) {
      console.log(err.response?.data);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-lg w-80">

        <h2 className="text-xl font-bold mb-5 text-center">
          LMS Login
        </h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full border p-2 mb-3 rounded"
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-4 rounded"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white py-2 rounded"
        >
          Login
        </button>

      </div>
    </div>
  );
}