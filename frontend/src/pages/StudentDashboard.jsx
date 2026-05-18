import { useEffect,useState } from "react";
import axios from "axios";

function StudentDashboard(){

const [courses,setCourses]=useState([]);

useEffect(()=>{

fetchCourses();

},[]);


const fetchCourses=async()=>{

try{

const res=
await axios.get(
"http://localhost:5000/student-courses/3"
);

setCourses(
res.data
);

}

catch(err){

console.log(err);

}

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

{/* SIDEBAR */}

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
Student Portal
</h2>

<div style={menuItem}>
Dashboard
</div>

<div style={menuItem}>
Assigned Courses
</div>

<div style={menuItem}>
Progress
</div>

<div style={menuItem}>
Quizzes
</div>

<div style={menuItem}>
Certificates
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
Assigned Courses
</h1>


<div
style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"20px"
}}
>

{courses.map((course)=>(

<div
key={course.id}
style={courseCard}
>

<div
style={{
position:"relative"
}}
>

<div
style={watermark}
>

student@lms.com |
Protected Session

</div>

<iframe
width="100%"
height="220"
src={
course.youtube_link
.replace(
"watch?v=",
"embed/"
)
}
allowFullScreen
style={{
borderRadius:"15px"
}}
></iframe>

</div>


<h2
style={{
marginTop:"15px"
}}
>
{course.title}
</h2>


<p
style={{
marginTop:"10px",
color:"#94a3b8"
}}
>
{course.description}
</p>


<div
style={{
marginTop:"20px"
}}
>

<h4>
Progress: 70%
</h4>

<div
style={progressBar}
>

<div
style={progressFill}
>

</div>

</div>

</div>

</div>

))}

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

const courseCard={

background:"#111827",
padding:"20px",
borderRadius:"20px"

};

const watermark={

position:"absolute",
top:"10px",
left:"10px",
background:"rgba(0,0,0,.6)",
padding:"8px",
borderRadius:"10px",
zIndex:100

};

const progressBar={

width:"100%",
height:"20px",
background:"#334155",
borderRadius:"20px",
marginTop:"10px"

};

const progressFill={

width:"70%",
height:"100%",
background:"#2563eb",
borderRadius:"20px"

};

export default StudentDashboard;