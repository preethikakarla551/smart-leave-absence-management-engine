<div align="center">

<img src="docs/assets/smart-leave-banner.svg" alt="Smart Leave Engine" width="100%" />

### A full-cycle leave management project built with a colorful, cloud-first experience

<a href="https://d2a9x7dvtwdsno.cloudfront.net"><img src="https://img.shields.io/badge/Live%20portal-HTTPS-147D6B?style=for-the-badge&logo=amazoncloudfront&logoColor=white" alt="Open live portal" /></a>
<img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=20232A" alt="React" />
<img src="https://img.shields.io/badge/Auth-Amazon%20Cognito-8C4FFF?style=for-the-badge&logo=amazoncognito&logoColor=white" alt="Amazon Cognito" />
<img src="https://img.shields.io/badge/Hosting-S3%20%2B%20CloudFront-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" alt="S3 and CloudFront" />

<br />

![Project status](https://img.shields.io/badge/Project-Integration%20validation%20in%20progress-7C3AED?style=flat-square)
![Region](https://img.shields.io/badge/AWS%20region-us--east--2-2563EB?style=flat-square&logo=amazonaws&logoColor=white)
![License](https://img.shields.io/badge/License-Educational%20project-0F766E?style=flat-square)

</div>

## Project overview

Smart Leave Engine brings employees, managers, and HR into one leave-management workflow. Employees can review balances, submit leave, and track requests. Managers and HR review requests, while approved absences feed the team calendar and downloadable report.

The React frontend is hosted privately in Amazon S3 and served over HTTPS through CloudFront. Cognito provides sign-in, and the frontend sends Cognito ID tokens to API Gateway routes for backend data and actions.

## What the project demonstrates

| Area | Project skills demonstrated |
| --- | --- |
| Frontend | React UI, reusable components, responsive dashboards, form validation, status displays, CSV export |
| Identity and security | Cognito sign-in and password challenges; bearer ID-token requests; API Gateway JWT authorization |
| Serverless data | API Gateway and Lambda integration with DynamoDB leave requests, employee balances, and configuration |
| Workflow automation | Step Functions manager/HR approval stages and timeout handling |
| Notifications and scheduling | SNS manager alerts, SES email notifications, and EventBridge weekly balance-summary job |
| Static web delivery | Production build, private S3 origin, CloudFront Origin Access Control, HTTPS and cache invalidation |

## Technology showcase

<p>
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=flat-square&logo=react&logoColor=20232A" alt="React" />
  <img src="https://img.shields.io/badge/Amazon%20Cognito-Authentication-8C4FFF?style=flat-square&logo=amazoncognito&logoColor=white" alt="Amazon Cognito" />
  <img src="https://img.shields.io/badge/API%20Gateway-HTTP%20API-FF4F8B?style=flat-square&logo=amazonaws&logoColor=white" alt="API Gateway" />
  <img src="https://img.shields.io/badge/AWS%20Lambda-Serverless%20logic-FF9900?style=flat-square&logo=awslambda&logoColor=white" alt="AWS Lambda" />
  <img src="https://img.shields.io/badge/DynamoDB-Data-4053D6?style=flat-square&logo=amazondynamodb&logoColor=white" alt="DynamoDB" />
  <img src="https://img.shields.io/badge/Step%20Functions-Approval%20workflow-7C3AED?style=flat-square&logo=amazonaws&logoColor=white" alt="Step Functions" />
  <img src="https://img.shields.io/badge/EventBridge-Scheduling-E7157B?style=flat-square&logo=amazonaws&logoColor=white" alt="EventBridge" />
  <img src="https://img.shields.io/badge/SES-Email%20notifications-527FFF?style=flat-square&logo=amazonaws&logoColor=white" alt="Amazon SES" />
  <img src="https://img.shields.io/badge/SNS-Manager%20alerts-E7157B?style=flat-square&logo=amazonaws&logoColor=white" alt="Amazon SNS" />
  <img src="https://img.shields.io/badge/S3-Private%20origin-569A31?style=flat-square&logo=amazons3&logoColor=white" alt="Amazon S3" />
  <img src="https://img.shields.io/badge/CloudFront-HTTPS%20delivery-8C4FFF?style=flat-square&logo=amazoncloudfront&logoColor=white" alt="CloudFront" />
</p>

## Architecture

```mermaid
flowchart LR
  E[Employee / Manager / HR] --> CF[CloudFront over HTTPS]
  CF --> S3[Private S3 frontend]
  E --> C[Cognito sign-in]
  C -->|ID token| API[API Gateway]
  API --> L[Lambda functions]
  L --> D[(DynamoDB)]
  L --> SF[Step Functions approvals]
  SF --> L
  L -->|manager alert| SNS[Amazon SNS]
  SNS --> M[Manager]
  L --> SES[SES notifications]
  EB[EventBridge weekly schedule] --> W[Weekly balance Lambda]
  W --> D
  W --> SES
```

## DynamoDB schema overview

![Smart Leave Engine DynamoDB schema overview](docs/schema/dynamodb-schema-overview.svg)

See the [DynamoDB schema documentation](docs/dynamodb-schema.md) for key attributes, table details, and quota rules.

## Workflow outcome screenshots

These AWS Step Functions execution graphs document four workflow outcomes from the project: manager approval followed by HR approval, manager approval, manager rejection, and HR-stage rejection.

### Manager approval followed by HR approval

<img src="docs/screenshots/workflow-hr-approval.png" alt="Step Functions execution with manager and HR approval completed" width="100%" />

### Manager approval

<img src="docs/screenshots/workflow-manager-approval.png" alt="Step Functions execution with manager approval completed" width="100%" />

### Manager rejection

<img src="docs/screenshots/workflow-manager-rejection.png" alt="Step Functions execution with manager rejection completed" width="100%" />

### HR-stage rejection

<img src="docs/screenshots/workflow-hr-rejection.png" alt="Step Functions execution showing the HR-stage rejection path and final LeaveRejected state" width="100%" />

## Step Functions definition

The current Amazon States Language (ASL) definition is available at [`docs/workflows/SmartLeaveEngineStateMachine.asl.json`](docs/workflows/SmartLeaveEngineStateMachine.asl.json). It includes manager and HR approval, rejection recording, timeout notifications, and final workflow outcomes. The Lambda ARNs in this snapshot point to the project AWS account; update them for another account before deploying.

## Notification screenshots

These examples show SES email notifications: the 48-hour manager-inactivity alert sent to HR and the manager approval email. The alert screenshots contain test employee names and request IDs. Amazon SNS is included in the architecture for manager alerts; a separate SNS delivery screenshot was not supplied.

<details>
  <summary>48-hour alert details</summary>
  <img src="docs/screenshots/notification-48-hour-alert-details.png" alt="48-hour approval overdue alert with test request details" width="512" />
</details>

<details>
  <summary>48-hour alert email</summary>
  <img src="docs/screenshots/notification-48-hour-alert-email.png" alt="Email notification that a manager approval is overdue" width="512" />
</details>

<details>
  <summary>Manager approval email with approve and reject actions</summary>
  <img src="docs/screenshots/notification-manager-approval-email.png" alt="SES leave request email containing manager approve and reject actions" width="800" />
</details>

Do not upload passwords, Cognito tokens, or signed approval-link tokens. The two browser screenshots containing signed tokens are intentionally excluded.

The employee submission and post-approval employee confirmation email still need screenshots to complete the end-to-end evidence set.

## Current integration status

- Cognito sign-in and the employee, manager, and HR API dashboard routes are integrated in the frontend.
- Leave submission and approval actions call authenticated API Gateway routes.
- The weekly EventBridge Lambda has successfully run and sent a balance-summary email.
- The workflow screenshots include completed manager approval, manager-plus-HR approval, manager rejection, and HR-stage rejection paths. If an approval returns HTTP 409, inspect the employee balance record: `available` and `used` must be DynamoDB Numbers, not Strings.
- The backend and SAM infrastructure are maintained separately from this frontend repository by the infrastructure owner.

This is a team project in active integration. Confirm the deployed routes, table names, IAM policies, and workflow definition against the team’s current SAM stack before using the portal with real employees.

## Run locally on Windows

Requirements: Node.js and npm.

1. Clone this repository and open PowerShell in its folder.
2. Copy the sample configuration:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. Install packages and start the development server:

   ```powershell
   npm.cmd install
   npm.cmd start
   ```

4. Open `http://localhost:3000`.

The Cognito IDs and API URL are public client configuration values. Never put passwords, AWS access keys, HMAC secrets, Cognito tokens, or private employee data in `.env.local` or GitHub. `.env.local` is ignored by Git.

## Build and deploy the frontend

Run a production build:

```powershell
npm.cmd run build
```

Upload the **contents** of `build/` to the root of the private S3 bucket. Keep S3 Block Public Access enabled, use CloudFront Origin Access Control, set the default root object to `index.html`, require HTTPS, then invalidate `/*` after uploading.

## Repository map

```text
smart-leave-absence-management-engine/
├── cloudfront-s3/       # S3/CloudFront policy template
├── docs/
│   ├── assets/          # README artwork
│   ├── screenshots/     # Verified project outcome screenshots
│   ├── schema/          # Separate entity-and-attributes diagram per table
│   ├── workflows/       # Step Functions ASL definition
│   └── dynamodb-schema.md # Table keys, indexes, and leave-balance rules
├── public/
├── src/
│   ├── components/      # Employee and shared UI components
│   ├── config/          # Cognito and API configuration
│   ├── services/        # Cognito authentication and API requests
│   ├── App.js
│   └── index.js
├── .env.example
└── README.md
```

See the [DynamoDB schema and quota rules](docs/dynamodb-schema.md) for the table keys, observed indexes, item attributes, and the fields that still need confirmation against the deployed tables.

## Team

| Team member | Area |
| --- | --- |
| Sushant | DynamoDB schema and leave data logic |
| Omsri | Approval workflow and messaging |
| Payal | SAM infrastructure, security, and scheduled jobs |
| Preethi | Frontend, dashboards, and static hosting |
