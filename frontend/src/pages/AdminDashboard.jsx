import { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {

const [users,setUsers]=useState([]);
const [pending,setPending]=useState([]);
const [students,setStudents]=useState([]);
const [courses,setCourses]=useState([]);

const [email,setEmail]=useState("");
const [role,setRole]=useState("student");

const [selectedStudent,setSelectedStudent]=useState("");
const [selectedCourse,setSelectedCourse]=useState("");

useEffect(()=>{

loadData();

},[]);

const loadData=async()=>{

const u=
await axios.get(
"http://localhost:5000/users"
);

const p=
await axios.get(
"http://localhost:5000/pending-courses"
);

const s=
await axios.get(
"http://localhost:5000/students"
);

const c=
await axios.get(
"http://localhost:5000/courses"
);

setUsers(u.data);
setPending(p.data);
setStudents(s.data);
setCourses(c.data);

};

const createUser=async()=>{

await axios.post(

"http://localhost:5000/create-user",

{
email,
password:"123",
role
}

);

setEmail("");

loadData();

};


const assignCourse=async()=>{

await axios.post(

"http://localhost:5000/assign-course",

{
student_id:selectedStudent,
course_id:selectedCourse
}

);

alert(
"Course Assigned"
);

};


return(

<div
style={{
display:"flex",
background:"#020617",
color:"white",
minHeight:"100vh"
}}
>

<div
style={{
width:"250px",
background:"#111827",
padding:"30px"
}}
>

<h2
style={{
marginBottom:"40px"
}}
>
Admin Control
</h2>

<div style={menuItem}>
User Management
</div>

<div style={menuItem}>
Course Assignment
</div>

<div style={menuItem}>
Session Monitoring
</div>

<div style={menuItem}>
Course Approval
</div>

</div>


<div
style={{
flex:1,
padding:"40px"
}}
>

<h1
style={{
fontSize:"40px",
marginBottom:"30px"
}}
>
LMS Administration
</h1>


<div style={sectionBox}>

<h2>Create User</h2>

<input
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
style={inputStyle}
/>

<select
value={role}
onChange={(e)=>setRole(e.target.value)}
style={inputStyle}
>

<option value="student">
Student
</option>

<option value="trainer">
Trainer
</option>

<option value="admin">
Admin
</option>

</select>

<button
style={blueButton}
onClick={createUser}
>
Create User
</button>

</div>



<div style={sectionBox}>

<h2>
Assign Course To Student
</h2>

<select
style={inputStyle}
onChange={(e)=>
setSelectedStudent(
e.target.value
)}
>

<option>
Select Student
</option>

{
students.map(s=>(

<option
value={s.id}
key={s.id}
>

{s.email}

</option>

))
}

</select>


<select
style={inputStyle}
onChange={(e)=>
setSelectedCourse(
e.target.value
)}
>

<option>
Select Course
</option>

{
courses.map(c=>(

<option
value={c.id}
key={c.id}
>

{c.title}

</option>

))
}

</select>


<button
style={blueButton}
onClick={assignCourse}
>
Assign Course
</button>

</div>



<div style={sectionBox}>

<h2>
Pending Trainer Uploads
</h2>

{
pending.map(course=>(

<div
key={course.id}
style={approvalCard}
>

<span>
{course.title}
</span>

<div>

<button
style={approveBtn}
onClick={async()=>{

await axios.put(
`http://localhost:5000/approve-course/${course.id}`
);

loadData();

}}
>

Approve

</button>


<button
style={rejectBtn}
onClick={async()=>{

await axios.put(
`http://localhost:5000/reject-course/${course.id}`
);

loadData();

}}
>

Reject

</button>

</div>

</div>

))
}

</div>



<div style={sectionBox}>

<h2>
User Management
</h2>

<table style={{
width:"100%"
}}>

<thead>

<tr>

<th style={th}>
Email
</th>

<th style={th}>
Role
</th>

<th style={th}>
Status
</th>

<th style={th}>
Action
</th>

</tr>

</thead>

<tbody>

{
users.map(user=>(

<tr key={user.id}>

<td style={td}>
{user.email}
</td>

<td style={td}>
{user.role}
</td>

<td style={td}>
{user.disabled?
"Disabled":
"Active"}
</td>

<td style={td}>

<button
style={disableBtn}
onClick={async()=>{

await axios.put(
`http://localhost:5000/disable-user/${user.id}`
);

loadData();

}}
>

Disable

</button>

</td>

</tr>

))
}

</tbody>

</table>

</div>

</div>

</div>

)

}

const menuItem={
padding:"15px",
marginBottom:"10px",
background:"#1e293b",
borderRadius:"12px"
};

const sectionBox={
background:"#111827",
padding:"30px",
borderRadius:"20px",
marginBottom:"30px"
};

const inputStyle={
width:"100%",
padding:"14px",
marginBottom:"15px",
background:"#1e293b",
border:"none",
borderRadius:"10px",
color:"white"
};

const blueButton={
padding:"12px 20px",
background:"#2563eb",
border:"none",
color:"white",
borderRadius:"10px"
};

const approvalCard={
display:"flex",
justifyContent:"space-between",
padding:"20px",
marginTop:"15px",
background:"#1e293b",
borderRadius:"12px"
};

const approveBtn={
padding:"8px 15px",
background:"#059669",
color:"white",
border:"none",
borderRadius:"8px",
marginRight:"10px"
};

const rejectBtn={
padding:"8px 15px",
background:"red",
color:"white",
border:"none",
borderRadius:"8px"
};

const disableBtn={
padding:"8px",
background:"#ea580c",
border:"none",
color:"white",
borderRadius:"8px"
};

const th={
textAlign:"left",
padding:"15px"
};

const td={
padding:"15px"
};

export default AdminDashboard;