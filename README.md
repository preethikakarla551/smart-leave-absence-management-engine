# 💻 Smart Leave Engine — Frontend & UI Portals (Preethi's Work Breakdown)

Welcome to the frontend module of the **Smart Leave & Absence Management Engine**. This repository contains the complete React application source code, AWS Cognito authentication integration, responsive dashboards for employees and managers, and CloudFront/S3 infrastructure configurations developed by **Preethi (Person 4)**.

---

## 📌 Team Role Breakdown & Matrix

- **Person 1 (Sushant)**: Data & Logic (DynamoDB Schema, Quota Checking, Overlap Validation)
- **Person 2 (Omsri)**: Workflows (Step Functions, Email Notifications, Token Handling)
- **Person 3 (Payal)**: Automation (Infrastructure-as-Code, Security, Scheduled Tasks)
- **Person 4 (Preethi)**: Frontend (Employee & Manager Web Portals, Team Calendar, S3/CloudFront Hosting)

---

## 📌 Architecture & Scope

As **Preethi (Person 4)**, this domain handles the interactive web interface hosted on **Amazon S3** and globally distributed via **Amazon CloudFront**. It directly integrates with **Amazon Cognito** for user authentication and communicates with **AWS API Gateway** backend endpoints.

### Key Features
- **Authentication**: Role-based access control (Employee, Manager, HR Admin) using Amazon Cognito JWT tokens.
- **Employee Portal**:
  - **Leave Application Form**: Auto-calculates total days with built-in datepicker logic.
  - **Balance Cards**: Real-time visualization of available vs. used quota per leave type (Sick, Casual, Earned, Unpaid).
- **Manager & HR Portal**:
  - **Team Absence Calendar**: Matrix view showing daily employee attendance and approved leaves for Sushant, Omsri, Payal, and Preethi.
  - **Report Generator**: Date-range filterable report exporter producing client-side downloadable `.csv` files.

---

## 🛠️ Tech Stack & AWS Services

- **Frontend Framework**: React.js
- **Hosting & CDN**: Amazon S3 (Static Website Hosting) + Amazon CloudFront
- **Authentication**: Amazon Cognito (User Pools & Identity Pools)
- **State & Routing**: React Router / Axios for API Gateway REST calls

---

## 📂 Repository Layout

```text
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Employee/         # Leave Form & Quota Cards
│   │   └── Shared/           # Team Calendar & CSV Exporter
│   ├── config/               # AWS Cognito & API Gateway configs
│   └── services/             # REST API integration layer
├── cloudfront-s3/            # Infrastructure policies for hosting
├── .env.example              # Environment variable template
└── package.json
```

---

## 🚀 Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env`:
   ```bash
   cp .env.example .env
   ```
3. Run locally:
   ```bash
   npm start
   ```
