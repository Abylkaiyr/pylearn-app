# Python Learning Platform

A comprehensive React-based Python learning platform with interactive problems, solutions, and an online compiler.

## Features

- 🔐 User Authentication (LocalStorage-based)
- 📚 Problem Categories (Basic, Logical, Data Structures, Algorithms)
- 💻 Online Python Compiler (Pyodide)
- 👨‍💼 Admin Panel (Create, Edit, Delete Problems)
- 📖 Detailed Problem Explanations
- 🎥 Video Tutorial Support
- 📱 Responsive Design with Ant Design

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd python-learn-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Default Admin Accounts

- **Username:** `admin` | **Password:** `admin123`
- **Username:** `teacher` | **Password:** `teacher123`

## Project Structure

```
python-learn-app/
├── src/
│   ├── components/       # Reusable components
│   ├── pages/           # Page components
│   ├── data/            # JSON data files
│   ├── utils/           # Utility functions
│   └── App.jsx          # Main app component
├── public/              # Static assets
└── package.json
```

## Data Storage

All data is stored in:
- **LocalStorage** for user accounts and problems
- **JSON files** in `src/data/` for initial data structure

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Deployment

This app can be deployed to:
- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**

See deployment configuration files in the project root.

## Technologies Used

- React 19
- Vite
- Ant Design
- React Router
- Pyodide (Python Compiler)

## License

MIT
