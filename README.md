<!-- Software Requirements Specification (SRS) 
Learning Management System (LMS) 
Prepared for: LMS Project 
Version: 1.0 
1. Introduction 
1.1 Purpose 
This document describes the Software Requirements Specification (SRS) for a Simple and 
Secure Learning Management System (LMS).  
The purpose is to define functional and non-functional requirements clearly for 
development and implementation. 
1.2 Scope 
The LMS allows Admin/Trainers to upload course videos via YouTube links and Students to 
securely access and watch videos. 
The system ensures simplicity for students and reasonable security controls. 
2. Overall Description 
2.1 Product Perspective 
The LMS is a web-based application accessible via modern browsers. 
2.2 User Classes - Admin: Full system access - Trainer: Course and video management - Student: View-only access to assigned courses 
2.3 Operating Environment - Web browsers (Chrome, Edge, Firefox) - Desktop and Mobile devices 
3. Functional Requirements 
3.1 Authentication - Users shall log in using email/mobile and password - Only one active session per user is allowed - System shall auto-logout previous sessions on new login 
3.2 User Management - Admin shall create, edit, and disable users 
- Assign roles and courses 
3.3 Course Management - Admin/Trainer shall create courses - Add YouTube video links to courses 
3.4 Student Access - Students shall view only assigned courses - Students cannot download or share videos 
3.5 Session Control - System shall track IP and device info - Admin can force logout users 
4. Security Requirements - HTTPS communication - Encrypted password storage - Disable right-click and Print Screen - Dynamic watermark on videos - Token-based session validation 
5. Non-Functional Requirements - Easy to use UI - Fast page loading - Scalable to 500+ users - Mobile responsive design 
6. Assumptions & Constraints - Videos are hosted on YouTube - Complete prevention of screen recording is not possible - System focuses on deterrence and traceability 
7. Proposal Summary - Development Time: 2–3 weeks - Technology: React + Node.js/Django + PostgreSQL - Deployment: Cloud-based  -->
few insights 
project progress: 35%
<img width="1917" height="1044" alt="Screenshot 2026-04-24 011759" src="https://github.com/user-attachments/assets/dc8dfb75-abde-47bd-af52-27f90ce0f8a7" />

img1 dashboard main

<img width="1919" height="976" alt="image" src="https://github.com/user-attachments/assets/338857c1-8eaf-4ed2-bf8c-45a5ea38ad28" />

img2 course information page 

<img width="936" height="715" alt="image" src="https://github.com/user-attachments/assets/b40aaef1-60f8-4ccd-9428-5a307f3fca50" />

img3 login page 

<img width="1919" height="992" alt="image" src="https://github.com/user-attachments/assets/61bd4153-e50f-4cf9-99b0-aaba931a9a56" />
img4 admin dashboard

<img width="1853" height="892" alt="image" src="https://github.com/user-attachments/assets/c1d964a7-6c5d-43ea-a8f4-b3085b236b86" />

img5 add course pop up 





