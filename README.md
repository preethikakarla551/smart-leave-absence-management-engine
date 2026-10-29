# 🚀 Smart Leave & Absence Management Engine

The **Smart Leave & Absence Management Engine** is an event-driven, serverless enterprise platform designed to automate employee leave submissions, multi-tier manager/HR approval workflows, dynamic balance calculations, and team absence tracking. The backend and infrastructure leverage AWS DynamoDB, Step Functions, SES, SNS, EventBridge, Lambda, Cognito, and S3.

---

## 👥 Team Roles & Work Breakdown Matrix

This project is built and maintained by a 4-person engineering team, with distinct ownership across each layer of the architecture:

| Member | Primary Domain | AWS Services | Core Deliverables |
| :--- | :--- | :--- | :--- |
| **Sushant** | Data & Logic | DynamoDB, Lambda (Python) | DynamoDB Table Schemas, Overlap Detection, Atomic Quota Decrement Engine |
| **Omsri** | Workflows & Messaging | Step Functions, SNS, SES, API Gateway | Approval State Machine JSON, HMAC Token Generation, Action API Endpoints |
| **Payal** | Infrastructure & Automation | SAM / Terraform, EventBridge, Cognito | Cognito User Pool Setup, Weekly Carry-Forward Cron Lambda, 48-Hour Escalation Rules |
| **Preethi** | Frontend & UI Portals | S3, CloudFront, React.js / HTML | Employee/Manager Web Dashboards, Team Absence Calendar Matrix, CSV Report Exporter |

---

## 🏗️ Architecture & Module Details

### 1. Data & Logic Engine (Sushant)
- **DynamoDB Schema**: Configures `leave_requests` (PK = `employee_id`, SK = `request_id`), `leave_balances`, and `leave_config` tables.
- **Overlap Detection**: Rejects submitted requests that intersect with existing `PENDING` or `APPROVED` leave dates.
- **Atomic Balance Deduction**: Executes conditional updates (`available >= requested_days`) to prevent double-counting or negative balances.

### 2. Workflow Orchestration & Messaging (Omsri)
- **Step Functions State Machine**: Pauses execution using `.waitForTaskToken` while awaiting manager sign-off.
- **Notification Engine**: Generates HMAC-signed approval/rejection links and dispatches email notifications via SNS and SES.
- **Multi-Level Approvals**: Automatically routes requests with `total_days > 5` to HR Admin for secondary sign-off.

### 3. Infrastructure, Security & Automation (Payal)
- **Authentication**: Provisions Amazon Cognito User Pool with custom roles (`Employee`, `Manager`, `HR_Admin`).
- **Weekly Balance Cron**: Triggers `WeeklyBalanceCronLambda` every Sunday via EventBridge to process carry-forwards and email balance digests.
- **Escalation Rules**: Escalates requests to HR Admin if a manager does not act within 48 hours (`TimeoutSeconds: 172800`).

### 4. Frontend & UI Portals (Preethi)
- **Web Application**: Static React application hosted on Amazon S3 and distributed globally via Amazon CloudFront.
- **Employee Portal**: Interactive Leave Application Form with auto-calculated duration and visual Balance Cards for quotas.
- **Manager Portal**: Team Absence Calendar matrix view and client-side CSV Report Exporter.

---

## 📂 Repository Structure

```text
├── frontend/                  # Preethi
│   ├── public/
│   ├── src/
│   │   ├── components/       # Leave Form, Balance Cards, Team Calendar, CSV Exporter
│   │   ├── config/           # Cognito & API Gateway configs
│   │   └── services/         # REST API integration
│   └── cloudfront-s3/        # S3 Policy & CloudFront configs
├── backend-logic/             # Sushant
│   ├── dynamodb-schemas/     # Table definitions & GSI indexes
│   └── lambdas/              # Overlap detection & atomic updates
├── workflows/                 # Omsri
│   ├── state-machine.json    # Step Functions definition
│   └── approval-handler/     # HMAC token generator & API handler
├── infrastructure/            # Payal
│   ├── terraform/            # IaC definitions
│   └── cron-jobs/            # EventBridge weekly balance recalculations
└── README.md
```

---

## 🛠️ Environment Variables Setup

Create a `.env` file inside the root directory:

```env
REACT_APP_AWS_REGION=us-east-1
REACT_APP_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
REACT_APP_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_API_GATEWAY_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
```

---

## 🚀 Running the Project Locally

```bash
# Install dependencies
npm install

# Start local development server
npm start
```
