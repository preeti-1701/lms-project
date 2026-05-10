# Project Methodology

This document outlines the software development life cycle (SDLC) and technical architecture methodologies used in the development of the Learning Management System (LMS).

## 1. Software Development Life Cycle (SDLC)

The project follows an **Iterative and Incremental Development** approach, heavily inspired by Agile principles. Rather than a rigid waterfall sequence, development is broken down into progressive phases, allowing for continuous refinement and adaptation based on regular reviews against the Software Requirements Specification (SRS).

### Development Phases
*   **Phase 1: Foundation & Architecture:** Initial setup of the project structure, selection of the technology stack (Django, React, PostgreSQL), and design of the core database schemas.
*   **Phase 2: Core Backend Features:** Implementation of essential backend services including custom user authentication workflows, role-based access control (RBAC), and foundational course management APIs.
*   **Phase 3: UI/UX & Component Development:** Systematic development of frontend interfaces (e.g., Student, Trainer, and Admin Dashboards) utilizing a component-driven approach with a focus on modern, responsive, and visually appealing design paradigms (such as glassmorphism).
*   **Phase 4: Enterprise Scaling & Refactoring:** Upgrading system capabilities for production readiness. This includes migrating the database from SQLite to PostgreSQL, implementing audit logging, adding advanced enrollment logic, and establishing a Super Admin role.

### Requirements-Driven Approach
Development is strictly guided by the project's SRS. We conduct regular progress reviews to assess current implementation against required features, ensuring all functional and non-functional requirements are met before finalizing milestones.

## 2. Technical & Architectural Methodology

The application is built using modern full-stack web development best practices, prioritizing scalability, maintainability, and security.

### Decoupled Architecture (Separation of Concerns)
The system utilizes a strictly decoupled client-server architecture:
*   **Backend (Django REST Framework):** Acts exclusively as a data provider and business logic processor. It handles database transactions, API endpoint routing, data validation, and core security protocols.
*   **Frontend (React/Vite):** Functions as a standalone single-page application (SPA). It is responsible for all UI rendering, client-side routing, and state management, communicating asynchronously with the backend via RESTful JSON APIs.

### Component-Driven UI Design
The frontend is constructed using a modular, component-based methodology. 
*   UI elements (buttons, forms, data tables, layout wrappers) are built as reusable React components.
*   This approach ensures visual consistency across the diverse dashboards (Admin, Trainer, Student), accelerates development, and simplifies future maintenance.

### Security-First Implementation
Security measures are integrated directly into the core architecture rather than applied as an afterthought:
*   **Robust Authentication:** Custom user models supporting secure authentication flows (e.g., email/mobile + password).
*   **Access Control:** Granular role-based permissions enforced at the API route level.
*   **Session Management:** Implementation of single-session enforcement to prevent concurrent logins and unauthorized access.
*   **Data Integrity:** Secure password hashing and robust data validation before database insertion.

## Summary

By combining an iterative development lifecycle with a modern, decoupled architecture, the LMS is built to be a robust, scalable, and user-centric platform capable of evolving with future requirements.
