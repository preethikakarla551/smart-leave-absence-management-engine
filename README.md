# Smart Leave & Absence Management Engine

A React-based demonstration of an employee leave portal with an HR review screen. The long-term project plan is to connect the portal to AWS services for authentication, leave storage, approvals, and notifications.

> **Current status:** This repository currently contains a frontend demo. Sign-in uses demo-only credentials defined in the client code. Leave requests, balances, and approval changes are held in browser memory and are lost when the page is refreshed. Cognito, API Gateway, Lambda, DynamoDB, Step Functions, SNS, SES, and EventBridge are not connected to the running interface yet. Use fake data only.

## Current demo features

- Employee portal selection and demo sign-in.
- Leave request form, balance cards, and request history.
- HR view to review, approve, or reject requests.
- CSV export of the requests currently held in the browser.
- Responsive React interface with Lucide icons.

These are frontend demonstration behaviors. They do not enforce leave quotas, prevent overlapping requests, persist records, or provide secure role-based access on a server.

## Repository structure

```text
smart-leave-absence-management-engine/
├── cloudfront-s3/
│   └── s3-bucket-policy.json       # OAC policy template; replace its placeholders
├── public/                         # Static public assets
├── src/
│   ├── components/
│   │   ├── Employee/
│   │   │   ├── BalanceCards.jsx
│   │   │   └── LeaveForm.jsx
│   │   └── Shared/
│   │       ├── CsvExportButton.jsx
│   │       └── TeamCalendar.jsx
│   ├── config/
│   │   └── aws-config.js            # Placeholder AWS configuration
│   ├── services/
│   │   └── api.js                   # API helper scaffold; not wired into the demo UI
│   ├── App.js
│   └── index.js
├── .env.example                     # Placeholder values only
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Run locally

You need Node.js and npm installed. From the repository root:

```bash
npm install
npm start
```

For Windows PowerShell, if `npm` is blocked by the PowerShell script policy, use the Windows command launcher:

```powershell
npm.cmd install
npm.cmd start
```

The development site normally opens at `http://localhost:3000`.

## Build for deployment

Create the production build from the repository root:

```bash
npm run build
```

In Windows PowerShell, use `npm.cmd run build` if the `npm` command is blocked. The generated site is written to `build/`. Do not commit `build/` or `node_modules/`; they are generated or installed locally and are excluded by `.gitignore`.

## Host with private S3 and CloudFront

The current hosted demo uses Amazon S3 as a private origin and CloudFront with Origin Access Control (OAC).

1. Keep **Block all public access** enabled on the S3 bucket.
2. Configure the CloudFront origin as the regular S3 bucket origin, with OAC enabled. Do not use the S3 website endpoint when using OAC.
3. Set the CloudFront default root object to `index.html` and require HTTPS for viewers.
4. After running the production build, upload the **contents** of `build/` to the root of the bucket so `index.html` is at the bucket root. Do not upload the `build/` folder as a nested directory.
5. After a new upload, create a CloudFront invalidation for `/*` so cached files refresh.

The file `cloudfront-s3/s3-bucket-policy.json` is a template only. Replace its bucket, AWS account, and distribution ID placeholders with the values for your own deployment. Keep the policy restricted to the intended CloudFront distribution.

## Configuration and credentials

`.env.example` documents placeholder variable names for future Cognito and API Gateway integration. Copy it to `.env` only when you have real development configuration values. `.env` is ignored by Git. Do not commit AWS credentials, passwords, tokens, private keys, or real employee data.

The current demo login values are embedded in `src/App.js` so the front-end demo can be tried before Cognito is ready. They are not secure credentials: anyone can inspect a public frontend or repository to find them. Never reuse them for real accounts or sensitive information. Replace the demo check with Cognito authentication before using this application with employees.

## Planned AWS integration

The team plan calls for the following services, which must be implemented and connected before the project can be considered a full leave management system:

- **Cognito:** authenticate employees, managers, and HR administrators.
- **API Gateway and Lambda:** validate requests and expose authenticated API endpoints.
- **DynamoDB:** persist leave requests, balances, and configurable leave rules.
- **Step Functions:** coordinate manager and HR approvals.
- **SNS and SES:** notify managers and employees about workflow changes.
- **EventBridge:** run scheduled carry-forward and balance-summary jobs.

The API helper and AWS configuration files are scaffolding; placeholder URLs and IDs do not indicate that these services are deployed.

## Team responsibilities

| Team member | Planned area | Planned deliverables |
|---|---|---|
| Sushant | Data and logic | DynamoDB table design, overlap checks, and atomic balance updates |
| Omsri | Workflows and messaging | Approval workflow, signed action links, and notifications |
| Payal | Infrastructure and security | Cognito, infrastructure automation, and scheduled jobs |
| Preethi | Frontend and hosting | Employee/HR portal, calendar and reports as backend data becomes available, S3 and CloudFront hosting |

These are planned responsibilities; the status of each AWS service should be updated as the team implements and deploys it.
