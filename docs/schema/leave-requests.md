# `leave_requests` table

```mermaid
flowchart LR
  employee_id([employee_id · String · PK]) --> leave_requests[LEAVE_REQUESTS]
  request_id([request_id · String · SK]) --> leave_requests
  leave_type([leave_type · String]) --> leave_requests
  dates([start_date, end_date · ISO date Strings]) --> leave_requests
  total_days([total_days · Number · weekdays]) --> leave_requests
  status([status · String]) --> leave_requests
  manager_id([manager_id · String]) --> leave_requests
  manager_queue_key([manager_queue_key · String · index details verify]) --> leave_requests
  requires_hr([requires_hr_approval · Boolean]) --> leave_requests
  reason([reason · String]) --> leave_requests
  classDef entity fill:#e8f5f3,stroke:#0f766e,stroke-width:3px,color:#102a2a,font-weight:bold;
  classDef key fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#102a2a;
  class leave_requests entity;
  class employee_id,request_id key;
```

The main table keys are `employee_id` and `request_id`. `manager_queue_key` is present on request items; verify the deployed GSI name and key schema before documenting it as an index.
