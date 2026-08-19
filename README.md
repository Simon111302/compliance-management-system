# Compliance Management System

A web-based compliance issue tracking system for managing users, compliance records, evidence submissions, reviews, notifications, and audit activity.

## Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- CSS
- Vite development proxy
- Oxlint and Prettier

The frontend contains separate workflows for:

- Administrators
- Reviewers
- Reporters

### Backend

- Node.js
- Express 5
- TypeScript
- MongoDB Node.js driver
- Cookie-based session authentication
- `dotenv` for environment configuration
- AWS SDK for Amazon S3 integration

The backend exposes a versioned REST API under `/v1`.

### Data and File Storage

- MongoDB Atlas stores application data, including:
  - Users
  - Roles
  - Sessions
  - Compliance records
  - Audit logs
  - Notifications
  - Evidence metadata
- Amazon S3 stores uploaded compliance evidence files.

## Application Structure

```text
Compliance-App/
├── frontend/                 React and Vite frontend
│   └── src/
│       ├── controllers/      Frontend state and workflow controllers
│       ├── models/           Frontend data transformations
│       ├── pages/            Application pages
│       ├── routes/           Role-based frontend routes
│       ├── services/         API request services
│       ├── types/            TypeScript types
│       └── views/             Shared UI components
├── backend/                  Express API
│   └── src/
│       ├── config/           Environment and database configuration
│       ├── controllers/      HTTP request handlers
│       ├── middleware/       Authentication, roles, uploads, and errors
│       ├── models/           MongoDB document models
│       ├── routes/           API route definitions
│       ├── services/         Business logic and database operations
│       └── utils/             Validation and helper functions
├── .env                      Local environment variables
├── vercel.json               Frontend routing and API rewrite configuration
└── package.json               Development, build, and verification scripts
```

## How the System Works

1. A user opens the React frontend.
2. The frontend sends API requests to `/v1`.
3. During local development, Vite proxies `/v1` to `http://localhost:3001`.
4. In production, Vercel rewrites `/v1/*` requests to the Railway backend.
5. The Express API authenticates the user with a secure session cookie.
6. The API reads and writes application data in MongoDB Atlas.
7. Evidence files are uploaded to Amazon S3, while their metadata is stored in MongoDB.
8. Role-based authorization controls access for Admin, Reviewer, and Reporter users.

## Local Development

### Requirements

- Node.js 24 or a compatible current Node.js version
- npm
- MongoDB Atlas access
- AWS S3 access for evidence upload features

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env` file in the project root. The backend requires values for:

```text
MONGODB_URI
MONGODB_DATABASE
FRONTEND_ORIGIN
ADMIN_NAME
ADMIN_EMAIL
ADMIN_PASSWORD
AWS_REGION
S3_EVIDENCE_BUCKET
```

`VITE_API_URL` can be used for local API configuration. In production, the frontend uses `/v1` and the Vercel rewrite handles the backend connection.

### Start the frontend

```bash
npm run dev
```

The Vite frontend normally runs at:

```text
http://localhost:5173
```

### Start the backend

In a second terminal:

```bash
npm run dev:api
```

The API normally runs at:

```text
http://localhost:3001
```

Health check:

```text
http://localhost:3001/v1/health
```

## Scripts

```bash
npm run dev              # Start the Vite frontend
npm run dev:api          # Start the backend in watch mode
npm run build            # Typecheck and build frontend and backend
npm run build:frontend   # Build the Vite frontend
npm run build:api        # Compile the backend TypeScript
npm run typecheck        # Typecheck frontend and backend
npm run lint             # Run Oxlint
npm run format           # Format source files with Prettier
npm run format:check     # Check formatting without changing files
npm run preview          # Preview the production frontend build
```

## Deployment

The project is deployed using GitHub, Vercel, and Railway.

### GitHub

GitHub is the source repository and deployment trigger. The `main` branch is connected to both deployment platforms.

Push changes with:

```bash
git add .
git commit -m "Describe the change"
git push origin main
```

### Vercel: Frontend

Vercel builds and hosts the React/Vite frontend.

The production frontend is hosted at:

```text
https://comp-gov.vercel.app
```

Vercel uses the frontend build configuration and the rewrite in `vercel.json`:

```text
/v1/* -> https://compliance-management-system-production-68c9.up.railway.app/v1/*
```

Frontend-only changes normally redeploy on Vercel and do not require a Railway backend redeployment.

### Railway: Backend

Railway builds and runs the Express API from the `main` branch.

The production API is hosted at:

```text
https://compliance-management-system-production-68c9.up.railway.app
```

Railway runs:

```bash
npm run build:api
npm run start:api
```

The API health endpoint is:

```text
https://compliance-management-system-production-68c9.up.railway.app/v1/health
```

Backend changes require a Railway deployment. Railway environment variables contain the production MongoDB, AWS S3, frontend origin, and administrator configuration.

## Deployment Troubleshooting

### Frontend still calls the wrong API

Check that the frontend uses `/v1` in production and that `vercel.json` points to the current Railway domain. After pushing a change, wait for the Vercel deployment to finish and refresh the browser with `Ctrl + F5`.

### Railway does not create a new deployment

Railway only needs to redeploy when backend files or backend configuration change. A frontend-only commit may not create a meaningful backend deployment.

### API returns `405` or `404` during login

The correct login endpoint is:

```text
POST /v1/auth/login
```

A request to `/auth/login` without `/v1` is incorrect.

### API returns `Invalid email or password`

Check the production administrator credentials configured in Railway and the existing administrator record in MongoDB. Updating Railway environment variables alone does not automatically change an existing MongoDB user record.

## Verification Before Deployment

Run the complete verification command before pushing:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
```

Do not commit `.env` files or expose MongoDB, AWS, or administrator credentials in source control.
