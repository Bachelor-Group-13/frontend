# Inneparkert Frontend

The frontend application for Inneparkert, a smart parking management system developed as a bachelor project in collaboration with Twoday.

## Overview

This is the frontend part of the Inneparkert system, built with Next.js and TypeScript. The application provides a modern, user-friendly interface for managing parking operations.

## Features
- **User Interface**
  - Modern, responsive design using Tailwind CSS 
  - Intuitive navigation and user flows
  - Real-time updates and feedback

- **User Management**
  - Secure authentication system
  - Profile management with license plate handling
  - User settings and preferences

- **Parking Management**
  - Real-time parking spot visualization
  - License plate validation and management

## Technical Details

### Built With

- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Package Manager**: pnpm

### Project Structure

```
frontend/
├── app/              # Next.js app router pages
├── components/       # Reusable UI components
│   ├── auth/        # Authentication components
│   ├── profile/     # Profile management
│   └── ui/          # Shadcn UI components
├── lib/             # Utilities and hooks
│   ├── hooks/       # Custom React hooks
│   ├── services/    # API services
│   └── utils/       # Helper functions
└── public/          # Static assets
```

## Getting Started

### Prerequisites

- Node.js 
- pnpm (package manager)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Bachelor-Group-13/frontend.git
cd frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env` file with:
```env
NEXT_PUBLIC_API_URL=backend_api_url
NEXT_PUBLIC_VISION_API_URL=vision_api_url
NEXT_PUBLIC_VAPID_PUBLIC_KEY=vapid_public_key
NEXT_PUBLIC_VAPID_PRIVATE_KEY=vapid_private_key
```

4. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Development

### Code Style

- ESLint for code quality
- Prettier for consistent formatting
- TypeScript for type safety

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

## Project Status

This project is part of a bachelor project. The frontend application is designed to work when set up with:
- A Spring Boot backend API service
- A Python vision API service

## Team

- Viljar Hoem-Olsen 
- Thomas Åkre
- Sander Grimstad

