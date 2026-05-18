import {useState,useEffect} from "react";
import axios from "axios";

function TrainerDashboard(){

const [courses,setCourses]=useState([]);

const [title,setTitle]=useState("");
const [description,setDescription]=useState("");
const [link,setLink]=useState("");

const [progress,setProgress]=useState([]);

useEffect(()=>{

load();

},[]);

const load=async()=>{

const c=
await axios.get(
"http://localhost:5000/courses"
);

const p=
await axios.get(
"http://localhost:5000/progress"
);

setCourses(c.data);

setProgress(p.data);

};

const upload=async()=>{

await axios.post(

"http://localhost:5000/upload-course",

{
title,
description,
youtube_link:link
}

);

alert(
"Course submitted for approval"
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

<h2 style={{
marginBottom:"40px"
}}>
Trainer Portal
</h2>

<div style={menuItem}>
Dashboard
</div>

<div style={menuItem}>
My Courses
</div>

<div style={menuItem}>
Student Progress
</div>

</div>


<div style={{
flex:1,
padding:"40px"
}}>

<h1 style={{
fontSize:"40px",
marginBottom:"30px"
}}>
Trainer Dashboard
</h1>


<div style={sectionBox}>

<h2>
Create Course
</h2>

<input
placeholder="Course title"
style={inputStyle}
onChange={(e)=>setTitle(e.target.value)}
/>

<textarea
placeholder="Description"
style={{
...inputStyle,
height:"120px"
}}
onChange={(e)=>setDescription(e.target.value)}
/>

<input
placeholder="Youtube Link"
style={inputStyle}
onChange={(e)=>setLink(e.target.value)}
/>

<button
style={blueButton}
onClick={upload}
>
Upload Course
</button>

</div>



<div style={sectionBox}>

<h2>
My Courses
</h2>

<div style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"20px"
}}>

{
courses.map(course=>(

<div
key={course.id}
style={courseCard}
>

<h3>
{course.title}
</h3>

<p style={{
marginTop:"10px",
color:"#94a3b8"
}}>
{course.description}
</p>

</div>

))
}

</div>

</div>



<div style={sectionBox}>

<h2>
Student Progress & Quiz
</h2>

<table style={{
width:"100%"
}}>

<thead>

<tr>

<th style={th}>
Student
</th>

<th style={th}>
Course
</th>

<th style={th}>
Progress
</th>

<th style={th}>
Marks
</th>

</tr>

</thead>

<tbody>

{
progress.map((p,i)=>(

<tr key={i}>

<td style={td}>
{p.email}
</td>

<td style={td}>
{p.title}
</td>

<td style={td}>
{p.completion_percentage}%
</td>

<td style={td}>
{p.marks}
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

const courseCard={
background:"#1e293b",
padding:"20px",
borderRadius:"15px"
};

const th={
padding:"15px",
textAlign:"left"
};

const td={
padding:"15px"
};

export default TrainerDashboard;