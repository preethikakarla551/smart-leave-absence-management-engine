# Smart Leave & Absence Management Engine

## Overview

The Smart Leave & Absence Management Engine is a serverless leave management project. Employees can request time off and track decisions. Managers and HR review requests through a structured approval flow, while the system tracks leave balances, sends notifications, and gives HR a view of team absences.

This repository currently contains the **Person 4 frontend prototype**. The AWS services and backend workflows below describe the planned team architecture; they should not be considered deployed or complete until the team implements and verifies them.

## Features

### Frontend prototype currently included

- Employee leave request form with date-range estimate
- Leave balance cards
- Request history with status badges
- Manager/HR pending request view
- Team absence calendar
- CSV download from sample data
- Responsive page layout

The prototype uses fictional sample records and browser storage. It is for UI demonstration only.

### Planned full-system capabilities

- Cognito sign-in for Employee, Manager, and HR Admin roles
- Configurable quotas for Sick, Casual, Earned, and Unpaid leave
- Balance and overlapping-request validation by backend services
- Manager approval, with HR approval for requests longer than five days
- Submission and decision email notifications
- Weekly carry-forward and balance summary processing
- Escalation of manager requests after 48 hours

## AWS architecture planned by the team

| AWS service | Planned purpose |
|---|---|
| Amazon Cognito | User sign-in and role-aware access |
| Amazon S3 | Static frontend file storage |
| Amazon CloudFront | HTTPS delivery of the frontend |
| Amazon API Gateway | Frontend API entry point |
| AWS Lambda | Request validation, data operations, and scheduled processing |
| AWS Step Functions | Manager and HR approval workflow |
| Amazon DynamoDB | Leave requests, balances, and leave-type configuration |
| Amazon SNS | Manager notification delivery |
| Amazon SES | Employee and HR email notifications |
| Amazon EventBridge | Weekly balance processing schedule |

## Request workflow planned

1. An employee signs in and submits a leave request.
2. The backend validates the request, including balance and date conflicts.
3. The request is stored and the manager approval workflow starts.
4. For requests of five days or fewer, manager approval leads to final processing.
5. For requests longer than five days, HR approval follows manager approval.
6. Leave balance is decremented only after final approval.
7. The employee receives a status notification.

The approval links, API endpoints, email behavior, and timeout handling depend on the backend implementation and must be confirmed with the team.

## Planned DynamoDB data model

The implementation blueprint specifies these tables. Person 1 owns the data model and backend logic.

### `leave_requests`

| Attribute | Purpose |
|---|---|
| `employee_id` | Partition key |
| `request_id` | Sort key |
| `leave_type` | Requested leave category |
| `start_date`, `end_date` | Requested date range |
| `total_days` | Requested duration |
| `status` | `PENDING`, `APPROVED`, or `REJECTED` |
| `manager_id` | Manager responsible for review |

The blueprint also calls for a status lookup index for administrative review.

### `leave_balances`

Employee ID is the partition key, with a sort key in the form `year#leave_type` (for example, `2026#SICK`). Balance records include allocated, used, and available amounts.

### `leave_config`

Leave type is the partition key. Configuration includes annual quota, carry-forward limit, and the number of days that triggers HR approval. Quotas are configuration data, not frontend constants.

## Frontend files

```text
frontend/
  index.html    # Current responsive portal prototype
.gitignore
README.md
```

## Run locally

No package installation is required for the current static prototype.

1. Open the repository folder in Visual Studio Code.
2. Open `frontend/index.html` in a browser, or use the Live Server extension.
3. Use the left navigation to switch between **My leave**, **Team & approvals**, and **Absence calendar**.
4. Use the role selector to preview employee and manager/HR screens.

## Preview mode and limitations

The page uses synthetic sample data and stores demo changes in the browser. The form, sample approval actions, and CSV downloads do not call AWS.

Preview mode does **not** authenticate with Cognito, call API Gateway, send email, run Step Functions, or read/write DynamoDB. The weekday estimate excludes weekends but does not account for holidays or individual schedules. Backend rules must remain authoritative for balances, conflicts, approvals, and final deductions.

## Frontend and backend integration

The current implementation is a single static HTML page; it does not yet have separate API, authentication, or build configuration files. Before connecting it, the frontend and backend teams must agree on:

- API base URL, routes, request/response fields, and error format
- Balance and request-history response formats
- Manager team scoping and HR access rules
- Whether approvals can be made in the portal or only from signed email links
- Cognito User Pool, public app client ID, region/domain, callback URLs, and role claim format
- API token requirements and allowed frontend CORS origin
- Calendar timezone, pending-request display, and CSV columns/date-range behavior

These details are not defined as HTTP contracts in the project blueprint. Do not invent routes or put secrets, client secrets, AWS credentials, HMAC keys, or Step Functions task tokens in browser code. Backend services must enforce authorization; hiding a UI control is not security.

## Team work allocation

- **Person 1:** DynamoDB schema, leave quota and overlap checks, request APIs, and final balance deduction.
- **Person 2:** Step Functions approval orchestration, SNS/SES notifications, and signed manager approval action handling.
- **Person 3:** Infrastructure as code, Cognito/security setup, weekly scheduled processing, and 48-hour escalation automation.
- **Person 4:** Employee and manager/HR portals, frontend Cognito integration, team calendar, CSV export, and static frontend presentation.

Coordinate API and authentication contracts with the owners above before wiring the frontend.

## Deploy the static frontend

The planned hosting path is Amazon S3 with CloudFront. Coordinate resource ownership and domain settings with Person 3.

1. Upload the deployable frontend files to the team's agreed S3 bucket.
2. Keep the bucket private and serve it through CloudFront with Origin Access Control and HTTPS.
3. Register the deployed HTTPS URL as a Cognito callback and sign-out URL.
4. Configure API CORS for the deployed frontend origin.
5. Verify login, role restrictions, API access, and CSV permissions using synthetic accounts and data.

Keep employee records behind authorized APIs. Do not put employee data in the public frontend bucket.

## Screenshots for the project demo

- Employee leave dashboard and balance cards
- Leave request and resulting status
- Manager/HR pending approvals
- Absence calendar and CSV report
- Cognito sign-in and role-restricted views
- Step Functions execution and email notification

Use synthetic employee data in screenshots.

## Before production

- Replace browser sample data with the agreed API client.
- Integrate Cognito with the team's approved browser authentication approach.
- Enforce roles and data scope in backend APIs.
- Verify balance, overlap, holiday, and approval rules in backend services.
- Add loading, empty, retry, expired-session, and API error states.
- Confirm date/timezone and CSV export rules with the team.
- Keep S3 private behind CloudFront and never commit credentials or real employee data.
