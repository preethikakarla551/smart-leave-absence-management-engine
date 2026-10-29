# Person 4: start here

This handoff contains a browser-only leave portal prototype and a practical build/deploy plan. The example repository you found belongs to someone else, so do not commit changes there. Create a new repository under your team's GitHub organization or agreed owner's account.

## What is ready

- `leave-portal-prototype.html` is a standalone responsive prototype with employee leave balances, an application form, request history and statuses, manager/HR approvals, a month calendar, and CSV downloads.
- The prototype uses sample data and browser storage. Its approval and submission actions do not call AWS. Do not treat it as production authentication or connect it to real employee data.

## Person 4 scope from the blueprint

You own the responsive employee and manager/HR portals, the absence calendar, CSV export, Cognito sign-in integration in the frontend, and the S3/CloudFront presentation. Person 3 owns provisioning/security and automation, including Cognito user-pool configuration, JWT/API Gateway security, IaC, EventBridge schedules, and edge-case automation. Coordinate Cognito settings and CloudFront/bucket ownership with Person 3; do not create a second pool or duplicate their infrastructure.

Person 1 owns table shapes, request/balance business logic, CRUD APIs, quota checks, overlap checks, and final balance deduction. Person 2 owns Step Functions, notifications, and the signed approval action endpoint. The UI should call their agreed API contracts; the UI must not itself decide whether a balance is valid or finalize approval.

## Create your team repository in GitHub

1. Sign in to GitHub and open the team's organization (or your agreed account).
2. Choose **New repository**. Use the team's agreed name, such as `smart-leave-absence-management-engine`; first check with teammates to avoid making a second repo with a conflicting name.
3. Choose **Private** unless the team explicitly wants it public. Add a README and `.gitignore` for Node if starting from scratch. Do not add real employee data, credentials, AWS keys, Cognito client secrets, or signed approval tokens.
4. Create the repository, then use **Add file → Upload files** to add the first files, or clone it locally and copy the starter files into it.

Suggested frontend layout (fit this into the agreed team's root structure):

```text
frontend/
  index.html                 # move/rename prototype here as first UI milestone
  src/
    app.js                   # view state, form interactions, navigation
    styles.css               # responsive styles
    api.js                   # agreed API adapter; no guessed URLs
    auth.js                  # Cognito sign-in/token adapter; no secrets
    calendar.js              # calendar rendering and date navigation
    csv.js                   # CSV generation/download
    config.example.js        # documented non-secret config names only
  README.md                  # local run, config, deploy, and known demo limits
```

For an initial class/team demo, the single HTML prototype can be committed as `frontend/index.html`; splitting it into modules is an optional cleanup after the interface/API contracts settle. Keep the backend and infrastructure folders owned by teammates intact. Suggested commits:

1. `feat(frontend): add leave portal prototype` — add `frontend/index.html` (or the prototype unchanged under a clearly named `prototype/` folder) and `frontend/README.md` describing sample-only data.
2. `feat(frontend): connect employee leave views` — add/update `frontend/src/api.js`, `frontend/src/auth.js`, and employee view modules only after Person 1/3 confirm interfaces.
3. `feat(frontend): add team approvals and absence reports` — add/update manager, calendar and CSV modules after Person 1/2 confirm the approval/report contract.
4. `docs(frontend): document S3 CloudFront deployment` — update the frontend README with the deployed CloudFront URL and release steps after Person 3 sets up the distribution.

These are proposed commit boundaries; actual paths must be aligned to the root layout your team chooses. I could not inspect the stranger's repo file tree from this environment, so these are not claims about its files.

## Confirm with teammates before API wiring

Ask Person 1 for the API base URL, CORS origin, routes/methods, request and response JSON, error format, date inclusivity, whether weekends/holidays count, leave type/config source, and role-specific fields. The blueprint gives DynamoDB keys and business rules, not an HTTP contract.

Ask Person 2 how manager decisions happen: whether the UI lists pending requests and posts a JWT-authorized decision, or approvals happen only through the signed email link. Do not put raw Step Functions task tokens, HMAC keys, or approval signing secrets in browser code. Confirm who supplies signed action links and whether the portal must support a separate HR approval queue.

Ask Person 3 for the existing Cognito User Pool ID, app client ID (public SPA client, with no client secret in the browser), region, domain, OAuth flow/scopes, sign-in/sign-out callback URLs, role/group claim format, API authorizer expectations, CORS origins, and the CloudFront distribution/bucket deployment owner. Also confirm whether Cognito managed login or the team's chosen frontend auth library is expected. The frontend may contain public identifiers, but no client secret or AWS credentials.

Agree on manager scope (team assignment claim or server-side filtering), HR visibility, CSV date range and exported columns, timezone, and whether the calendar includes pending requests. The prototype shows pending items in a separate color as an example; production behavior should follow the team's policy.

## AWS console walkthrough for Person 4

Use the team's designated AWS account and region. Person 3 should provision shared infrastructure where possible. Avoid creating parallel Cognito or CloudFront resources if Person 3's IaC owns them.

### A. Prepare the frontend for hosting

1. In the team repo, put the deployable static site in the agreed build folder (for a no-build prototype this can be `frontend/`; for a bundler it is normally `frontend/dist/`).
2. Replace sample data with the API adapter only when endpoints and shapes are agreed. Keep all runtime configuration free of secrets.
3. Choose and record the canonical site URL before setting Cognito callback URLs. A CloudFront URL is fine for a class demo; a custom domain can be added later.

### B. S3 and CloudFront (coordinate with Person 3)

Recommended pattern: a private S3 bucket as a regular S3 origin, CloudFront with Origin Access Control (OAC), and HTTPS to visitors. Do not enable public bucket access just to make the site load. AWS documents this secure static site path and recommends CloudFront/OAC for a private bucket.

If Person 3 has not created the resources and agrees you should do the console setup:

1. AWS Console → search **S3** → **Create bucket**. Use a globally unique name in the agreed region; leave **Block all public access** enabled and ACLs disabled/default. Create it.
2. Open the bucket → **Properties**. For the CloudFront/OAC pattern, do not use the S3 website endpoint; CloudFront uses the normal bucket origin. Leave website hosting off unless your teammate explicitly chooses the website endpoint pattern (that pattern cannot use OAC).
3. AWS Console → search **CloudFront** → **Create distribution**. Choose the S3 bucket as origin, create/select an OAC, and use the console option to update the bucket policy for CloudFront access. Set viewer protocol policy to redirect HTTP to HTTPS. Set the default root object to `index.html`. Create/save and wait for deployment.
4. If the distribution wizard did not update access, use the distribution's origin settings and the S3 bucket policy workflow to allow only that distribution's CloudFront service principal `s3:GetObject`; keep public access blocked. Person 3 should review the final policy.
5. Upload the deployable files to the bucket root (or team's chosen prefix): open bucket → **Upload** → **Add files/Add folder** → select the built site files, not the enclosing source folder → **Upload**.
6. Open the distribution's **General** tab and copy its domain name. Visit `https://<distribution-domain>/` after status is Deployed. For a one-page static prototype, root object `index.html` is enough; if the app later uses client-side routes, configure a suitable 403/404 fallback to `index.html` and confirm it does not hide real API errors.
7. On updates, upload the new build files. If the old page persists, create a CloudFront invalidation for `/index.html` (and changed asset paths as needed).

Do not use the S3 static website endpoint together with OAC. AWS's documentation distinguishes regular S3 origins from website endpoints; OAC is for regular bucket origins.

### C. Cognito integration (Person 3 creates/configures; Person 4 uses settings)

1. Ask Person 3 for the existing User Pool and agree on role assignment. Use the same pool as the API authorizer.
2. When the hosted sign-in page is ready, Person 3 should set the app client's allowed callback URL to the exact deployed site URL (and the local development URL if needed), plus an exact sign-out URL. Cognito requires pre-registered absolute callback URLs and HTTPS except localhost during testing.
3. Use an OAuth authorization-code flow with PKCE for a browser app, subject to the team's auth-library and API contract. Do not create a browser app client with a client secret.
4. Frontend obtains a user access token from the auth library, sends it as `Authorization: Bearer <access-token>` to API routes, and relies on API Gateway to verify the token/role. The browser's role display is not a security boundary; backend authorization must enforce all access.
5. Verify login, logout, expired session, employee view, manager/HR role view, and rejected access to a role-restricted API with Person 3's test accounts. Never expose real secrets in GitHub or browser source.

### D. Coordinate API testing with the team

1. Ask Person 1 for a non-production test employee, balances, and sample request responses.
2. Confirm allowed CloudFront origin in API CORS with Person 1/3. If browser preflight fails, share the exact browser error and request headers with them; do not weaken CORS to `*` for authenticated production routes.
3. Confirm with Person 2 whether approvals in the portal are a separate authenticated API or are only through emailed signed links. The blueprint describes signed manager links; UI buttons need a separate safe API contract if the team wants them.
4. Validate one employee submission, one insufficient-balance response, one overlap response, manager approval, HR approval when required, and the final status/balance display against backend records. Capture demo screenshots only with synthetic data.

## Demo checklist

- Employee can see balance cards and history/status badges.
- Form calculates weekdays for preview; backend remains authoritative about dates, holidays, quota, overlap, and final deduction.
- Submission displays a real backend result when integrated; the current prototype only stores local sample/demo data.
- Manager/HR can see only authorized pending requests, with status refreshed from the API.
- Calendar dates/statuses match the API and agreed timezone policy.
- CSV respects role permissions, chosen date range, agreed columns, and correct escaping.
- Cognito callback/logout and API authorization work on the CloudFront HTTPS URL.
- S3 is not public when using the CloudFront/OAC design.

## References

- Blueprint supplied with the project: responsibilities, data model, workflow, and three-page implementation checklist.
- [AWS CloudFront secure static website guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/getting-started-secure-static-website-cloudformation-template.html)
- [AWS S3 access control guidance](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-management.html)
- [CloudFront OAC setup](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
- [Cognito managed login setup](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-managed-login.html)
- [Cognito app-client settings and callback URLs](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html)
