Software Requirements Specification (SRS)
Learning Management System (LMS)
Prepared for: LMS Project
Version: 1.0

<<<<<<< HEAD
 Introduction
=======
Introduction
>>>>>>> 46d2ffa3dfaa769a1d5d7e22b25b4791e7ab60cc
1.1 Purpose
This document describes the Software Requirements Specification (SRS) for a Simple and Secure Learning Management System (LMS). 
The purpose is to define functional and non-functional requirements clearly for development and implementation.

1.2 Scope
The LMS allows Admin/Trainers to upload course videos via YouTube links and Students to securely access and watch videos.
The system ensures simplicity for students and reasonable security controls.

<<<<<<< HEAD
 Overall Description
=======
Overall Description
>>>>>>> 46d2ffa3dfaa769a1d5d7e22b25b4791e7ab60cc
2.1 Product Perspective
The LMS is a web-based application accessible via modern browsers.

2.2 User Classes
- Admin: Full system access
- Trainer: Course and video management
- Student: View-only access to assigned courses

2.3 Operating Environment
- Web browsers (Chrome, Edge, Firefox)
- Desktop and Mobile devices

<<<<<<< HEAD
 Functional Requirements
=======
Functional Requirements
>>>>>>> 46d2ffa3dfaa769a1d5d7e22b25b4791e7ab60cc
3.1 Authentication
- Users shall log in using email/mobile and password
- Only one active session per user is allowed
- System shall auto-logout previous sessions on new login

3.2 User Management
- Admin shall create, edit, and disable users
- Assign roles and courses

3.3 Course Management
- Admin/Trainer shall create courses
- Add YouTube video links to courses

3.4 Student Access
- Students shall view only assigned courses
- Students cannot download or share videos

3.5 Session Control
- System shall track IP and device info
- Admin can force logout users

<<<<<<< HEAD
 Security Requirements
=======
Security Requirements
>>>>>>> 46d2ffa3dfaa769a1d5d7e22b25b4791e7ab60cc
- HTTPS communication
- Encrypted password storage
- Disable right-click and Print Screen
- Dynamic watermark on videos
- Token-based session validation

<<<<<<< HEAD
 Non-Functional Requirements
=======
Non-Functional Requirements
>>>>>>> 46d2ffa3dfaa769a1d5d7e22b25b4791e7ab60cc
- Easy to use UI
- Fast page loading
- Scalable to 500+ users
- Mobile responsive design

<<<<<<< HEAD
 Assumptions & Constraints
=======
Assumptions & Constraints
>>>>>>> 46d2ffa3dfaa769a1d5d7e22b25b4791e7ab60cc
- Videos are hosted on YouTube
- Complete prevention of screen recording is not possible
- System focuses on deterrence and traceability
