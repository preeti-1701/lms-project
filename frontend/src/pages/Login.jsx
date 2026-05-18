import {useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

function Login(){

const navigate=useNavigate();

const [role,setRole]=useState("student");

const [form,setForm]=useState({

email:"",
password:""

});

const login=async()=>{

try{

const res=
await axios.post(

"http://localhost:5000/login",

{
email:form.email,
password:form.password
}

);

localStorage.setItem(
"token",
res.data.token
);

localStorage.setItem(
"userRole",
res.data.role
);

if(res.data.role==="admin"){

navigate("/admin");

}

else if(
res.data.role==="trainer"
){

navigate("/trainer");

}

else{

navigate("/student");

}

}

catch{

alert(
"Invalid login"
);

}

};

return(

<div
style={{
height:"100vh",
display:"flex",
justifyContent:"center",
alignItems:"center",
background:"#020617",
color:"white"
}}
>

<div
style={{
width:"450px",
background:"#111827",
padding:"40px",
borderRadius:"25px"
}}
>

<h1
style={{
textAlign:"center"
}}
>
LMS Portal
</h1>

<p
style={{
textAlign:"center",
color:"#94a3b8"
}}
>
Secure Learning Management System
</p>

<select
value={role}
onChange={(e)=>
setRole(
e.target.value
)
}
style={input}
>

<option>
student
</option>

<option>
trainer
</option>

<option>
admin
</option>

</select>

<input
placeholder="Email"
style={input}
onChange={(e)=>
setForm({
...form,
email:e.target.value
})
}
/>

<input
type="password"
placeholder="Password"
style={input}
onChange={(e)=>
setForm({
...form,
password:e.target.value
})
}
/>

<button
style={btn}
onClick={login}
>
Login
</button>

</div>

</div>

)

}

const input={

width:"100%",
padding:"15px",
marginTop:"15px",
background:"#1e293b",
border:"none",
borderRadius:"10px",
color:"white"

};

const btn={

width:"100%",
padding:"15px",
marginTop:"20px",
background:"#2563eb",
border:"none",
borderRadius:"10px",
color:"white"

};

export default Login;