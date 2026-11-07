# DynamoDB schema

This document records the Smart Leave Engine tables and indexes discussed for the project. DynamoDB is schemaless for non-key attributes, so only partition keys, sort keys, and index keys are enforced by the service. Check names and key types in the deployed tables before treating any unverified index details as final.

## Table summary

| Table | Partition key | Sort key | Purpose |
| --- | --- | --- | --- |
| `employees` | `employee_id` (String) | None | Employee identity and organization mapping |
| `leave_requests` | `employee_id` (String) | `request_id` (String) | Leave applications and approval state |
| `leave_balances` | `employee_id` (String) | `balance_key` (String) | Per-employee, per-leave-type, per-year quota balances |
| `leave_type_config` | `leave_type_id` (String) | None | Configurable leave rules and annual quota settings |
| `leave_date_locks` | `employee_id` (String) | `date_key` (String) | Per-day locks used to stop overlapping leave requests |
| `leave_workflow_tasks` | `request_id` (String) | `approval_stage` (String) | Step Functions callback token for the active approval stage |
| `team_absences` | Confirm in the deployed table | Confirm in the deployed table | Calendar-oriented approved absence data, if populated by the backend |

The first six key definitions above reflect the project’s AWS Console views and integration work. The `team_absences` key schema was not visible in the material reviewed; copy its exact keys from the DynamoDB table details.

## Indexes

### `employees`

The console showed these indexes:

| Index | Key observed | Purpose |
| --- | --- | --- |
| `CognitoSubIndex` | `cognito_sub` (String) | Resolve a signed-in Cognito user to an employee record |
| `ManagerTeamIndex` | `manager_id` (String) | Find employees assigned to a manager |

Confirm each index’s sort key (if any), projection, and exact index name in DynamoDB → Tables → `employees` → Indexes.

### `leave_requests`

Request items include `manager_queue_key`, which can support a manager-queue index. The exact GSI name and key schema were not confirmed in the screenshots available for this documentation. Record the deployed GSI name, partition key, and sort key from the table’s **Indexes** tab before relying on it.

## Item attributes

### `employees`

Key: `employee_id` (String).

Observed attributes include `cognito_sub` (String), `employee_name` (String), `employee_email` (String), `department` (String), `designation` (String), `manager_id` (String), `hrmanager_id` (String), and `role` (String; examples included `EMPLOYEE`, `MANAGER`, and `HR`).

Keep the Cognito subject unique to one employee record. Backend role checks should use trusted Cognito claims and/or the matched employee record, not a role selected by the browser.

### `leave_requests`

Keys: `employee_id` and `request_id` (Strings).

Observed/requested attributes include:

| Attribute | DynamoDB type | Notes |
| --- | --- | --- |
| `leave_type` | String | `SICK`, `CASUAL`, `EARNED`, or `UNPAID` |
| `start_date`, `end_date` | String | ISO date format, `YYYY-MM-DD` |
| `total_days` | Number | Working-day count, excluding weekends |
| `reason` | String | Employee-provided explanation |
| `status` | String | For example `PENDING`, `PENDING_HR_REVIEW`, `APPROVED`, or `REJECTED` |
| `manager_id` | String | Assigned manager identifier |
| `manager_queue_key` | String | Queue/sort value used by manager query logic, if indexed |
| `requires_hr_approval` | Boolean | Whether a second approval stage applies |
| `employee_name`, `employee_email` | String | Request display/notification data |
| `created_at`, `updated_at` | String | ISO-8601 timestamps |

The backend should treat the DynamoDB item as authoritative, reject duplicate/overlapping dates, and make approval updates conditional so a request cannot be approved twice.

### `leave_balances`

Keys: `employee_id` (String) and `balance_key` (String). The sort key combines leave type and year, for example `SICK#2026` or `EARNED#2026`.

| Attribute | DynamoDB type | Meaning |
| --- | --- | --- |
| `allocated` | Number | Annual quota allocated |
| `available` | Number | Remaining balance available to request |
| `used` | Number | Days charged after final approval |
| `available_carry_forward_next_year` | Number | Eligible unused days to carry forward, subject to policy |

Keep all four balance values numeric. Existing String values such as `"12"` must be converted to DynamoDB Numbers; changing the type of a field in one item does not automatically convert other records. `UNPAID`/loss-of-pay requests normally do not consume a paid leave balance, according to the project rules.

### `leave_type_config`

Key: `leave_type_id` (String), with the four configured values `SICK`, `CASUAL`, `EARNED`, and `UNPAID`.

The console showed `annual_quota`, `carry_forward_max`, `is_unlimited`, and an HR-approval threshold field. Use Number for quotas/thresholds and Boolean for `is_unlimited`. Confirm the exact spelling of the HR-threshold attribute against the Lambda code before inserting or renaming it.

### `leave_date_locks`

Keys: `employee_id` (String) and `date_key` (String, `YYYY-MM-DD`). The item also contains `request_id` (String). A request spanning multiple dates uses one lock per working day, so concurrent submissions cannot claim the same employee/date pair.

### `leave_workflow_tasks`

Keys: `request_id` (String) and `approval_stage` (String, such as `MANAGER` or `HR`). Attributes include `task_token` (String) and `expires_at` (Number, Unix epoch seconds). Enable DynamoDB TTL on `expires_at` to clean up expired callback records. Treat `task_token` as a secret: never include real token values in screenshots, source control, or logs.

### `team_absences`

This table is intended for approved absence calendar data. Its exact keys and attributes must be copied from the deployed table and the Lambda/API code that writes it; do not infer its key design from the table name alone.

## Approval and quota rules

1. On submission, validate the employee, leave type, dates, available balance, and overlap rules.
2. Create the request as pending and reserve date-lock items for its working days.
3. Do not reduce `available` or increase `used` while the request is merely pending.
4. On final approval, conditionally mark the request approved and atomically decrement `available` and increment `used` for paid leave. Release date locks on rejection/cancellation.
5. For requests above the configured duration threshold, complete manager approval and then HR approval before charging the balance.
6. Run carry-forward logic from configuration values, cap the transfer at `carry_forward_max`, and store/send the computed balance summary without changing the type of numeric fields.

## What to verify in AWS Console

For each deployed table, open **DynamoDB → Tables → table name → General information** and record the partition/sort key names and types. Open **Indexes** to record every GSI’s name, partition key, sort key, and projection. Compare the result with this document and update it if the deployed SAM template is the source of truth.
