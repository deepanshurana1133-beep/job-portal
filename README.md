# Job Portal

Install the root npm workspaces and prepare the backend environment:

```powershell
npm install
Copy-Item backend\.env.example backend\.env
```

Set `JWT_SECRET` and, when email notifications are needed, `EMAIL_USER` and
`EMAIL_PASSWORD` in `backend\.env`. The default MongoDB URI is
`mongodb://127.0.0.1:27017/job_portal`; make sure MongoDB is running locally.
The frontend uses `http://localhost:3000` as its backend API URL by default.

Start both applications from the repository root:

```powershell
npm run dev
```

The backend listens on port 3000 and Angular serves on port 4200 and opens the
frontend in the default browser.

To add the 11 sample job listings to MongoDB, first register a recruiter
account, then run this command from the repository root:

```powershell
npm run seed:jobs --workspace backend
```

The seed command is safe to re-run: it adds missing sample jobs without
duplicating existing ones. The seeded jobs belong to the first recruiter
account in the database so recruiter application management remains available.
