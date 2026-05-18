require("dotenv").config();

const express=require("express");
const cors=require("cors");
const jwt=require("jsonwebtoken");

const pool=require("./db");

const app=express();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
res.send("LMS Backend Running");
});


app.post("/login",async(req,res)=>{

try{

const {email,password}=req.body;

const user=await pool.query(
"SELECT * FROM users WHERE email=$1",
[email]
);

if(user.rows.length===0)
return res.status(401).json({
message:"User not found"
});

const found=user.rows[0];

if(found.disabled)
return res.status(401).json({
message:"User disabled"
});

if(password!==found.password)
return res.status(401).json({
message:"Wrong password"
});

await pool.query(
"DELETE FROM sessions WHERE user_id=$1",
[found.id]
);

const token=jwt.sign(
{
id:found.id,
role:found.role
},
process.env.JWT_SECRET,
{
expiresIn:"1h"
}
);

await pool.query(
`
INSERT INTO sessions
(user_id,device_info,ip_address,token)
VALUES($1,$2,$3,$4)
`,
[
found.id,
"Chrome",
req.ip,
token
]
);

res.json({
token,
role:found.role,
id:found.id
});

}catch(err){

console.log(err);

res.status(500).json({
message:"Server error"
});

}

});


app.post("/create-user",async(req,res)=>{

const{
email,
password,
role
}=req.body;

await pool.query(

`
INSERT INTO users
(email,password,role)

VALUES($1,$2,$3)
`,

[
email,
password,
role
]

);

res.json({
message:"created"
});

});


app.put(
"/disable-user/:id",
async(req,res)=>{

await pool.query(

`
UPDATE users
SET disabled=true
WHERE id=$1
`,

[
req.params.id
]

);

res.json({
message:"disabled"
});

});


app.post(
"/upload-course",
async(req,res)=>{

const{
title,
description,
youtube_link
}=req.body;

await pool.query(

`

INSERT INTO courses
(
title,
description,
youtube_link,
trainer_id
)

VALUES($1,$2,$3,$4)

`,

[
title,
description,
youtube_link,
2
]

);

res.json({
message:"uploaded"
});

});


app.put(
"/approve-course/:id",

async(req,res)=>{

await pool.query(

`
UPDATE courses
SET approved=true
WHERE id=$1
`,

[
req.params.id
]

);

res.json({
message:"approved"
});

});


app.put(
"/reject-course/:id",

async(req,res)=>{

await pool.query(

`
DELETE FROM courses
WHERE id=$1
`,

[
req.params.id
]

);

res.json({
message:"deleted"
});

});


app.get(
"/courses",
async(req,res)=>{

const data=
await pool.query(

`
SELECT *
FROM courses
WHERE approved=true
`

);

res.json(
data.rows
);

});


app.get(
"/pending-courses",
async(req,res)=>{

const data=
await pool.query(

`
SELECT *
FROM courses
WHERE approved=false
`

);

res.json(
data.rows
);

});


app.get(
"/student-courses/:studentId",
async(req,res)=>{

const data=
await pool.query(

`
SELECT courses.*

FROM assignments

JOIN courses
ON assignments.course_id=
courses.id

WHERE
assignments.student_id=$1

AND
courses.approved=true

`,

[
req.params.studentId
]

);

res.json(
data.rows
);

});


app.get(
"/users",
async(req,res)=>{

const data=
await pool.query(

`
SELECT
id,
email,
role,
disabled

FROM users
`

);

res.json(
data.rows
);

});


app.get(
"/sessions",
async(req,res)=>{

const data=
await pool.query(

`

SELECT
sessions.id,
users.email,
sessions.device_info,
sessions.ip_address

FROM sessions

JOIN users
ON users.id=sessions.user_id

`

);

res.json(
data.rows
);

});


app.get(
"/progress",

async(req,res)=>{

const data=
await pool.query(

`

SELECT
users.email,
courses.title,
progress.completion_percentage,
quizzes.marks

FROM progress

JOIN users
ON users.id=progress.student_id

JOIN courses
ON courses.id=progress.course_id

LEFT JOIN quizzes
ON quizzes.course_id=
courses.id

`

);

res.json(
data.rows
);

});
app.post(
"/assign-course",
async(req,res)=>{

try{

const{
student_id,
course_id
}=req.body;

await pool.query(

`
INSERT INTO assignments
(student_id,course_id)

VALUES($1,$2)
`,

[
student_id,
course_id
]

);

res.json({
message:"assigned"
});

}

catch(err){

console.log(err);

res.status(500).json({
message:"Error"
});

}

});



app.get(
"/students",
async(req,res)=>{

const data=
await pool.query(

`

SELECT
id,
email

FROM users

WHERE role='student'

AND disabled=false

`

);

res.json(
data.rows
);

});

app.listen(
process.env.PORT,
()=>{
console.log(
`Server running on ${process.env.PORT}`
)
}
);