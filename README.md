# Uranus DB

Node.js backend API server using Express framework with TypeScript.

## Prerequisites

- Node.js (latest LTS version recommended)
- npm or yarn

## Installation

Install dependencies:

```bash
npm install
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Build for production:
```bash
npm run build
```

### Production mode:
```bash
npm start
```

The server will start on port 3000 by default (configurable via .env file).

## Project Structure

```
.
├── src/
│   └── index.ts          # Main server entry point (TypeScript)
├── dist/                 # Compiled JavaScript output (generated)
├── .env                  # Environment variables
├── .gitignore           # Git ignore rules
├── tsconfig.json        # TypeScript configuration
├── package.json         # Project dependencies and scripts
└── README.md           # This file
```

## Environment Variables

Configure the following in your `.env` file:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

## Available Endpoints

- `GET /` - Health check endpoint

## Next Steps

Add your API routes and business logic as needed.
