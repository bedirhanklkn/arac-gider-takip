# FiloTakip - Fleet Management System

A modern, fast, and comprehensive web application for managing vehicle fleets, tracking project-based vehicle assignments, and monitoring operational expenses. Built with Next.js, React, TailwindCSS, and Supabase.

## Features

- Fleet Dashboard: A high-level overview of total expenses, fleet availability status, active projects, and monthly expense trends.
- Vehicle Management: Add, edit, and track vehicles in the fleet. Monitor their status (Available, Rented, In Maintenance, Reserved), current mileage, and fuel types.
- Project Tracking: Create projects with specific start and end dates. Assign multiple vehicles to projects and track their operational status.
- Expense Monitoring: Log and manage vehicle-related expenses (Fuel, Maintenance, Insurance, Taxes, etc.). Expenses are automatically linked to both the vehicle and its currently assigned project.
- Data Integrity: Full relational database structure ensuring expenses remain tied to projects even after a vehicle is re-assigned.

## Technology Stack

- Frontend: Next.js (App Router), React, TailwindCSS
- UI Components: Shadcn UI, Base UI
- State Management: Zustand
- Data Visualization: Recharts
- Backend & Database: Supabase (PostgreSQL)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the database migrations (SQL scripts) provided in your Supabase SQL Editor to set up the necessary tables (vehicles, projects, expenses).
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open `http://localhost:3000` with your browser to see the result.

## Architecture & Design

The application follows a strictly "clean and corporate" design philosophy. The UI is built to be straightforward and functional without unnecessary visual clutter. It utilizes a modern dark/light aesthetic with structured data presentation for professional enterprise use.

## License

This project is proprietary and confidential.
