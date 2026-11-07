# `leave_balances` table

```mermaid
flowchart LR
  employee_id([employee_id · String · PK]) --> leave_balances[LEAVE_BALANCES]
  balance_key([balance_key · String · SK · e.g. SICK#2026]) --> leave_balances
  allocated([allocated · Number]) --> leave_balances
  available([available · Number]) --> leave_balances
  used([used · Number]) --> leave_balances
  carry_forward([available_carry_forward_next_year · Number]) --> leave_balances
  classDef entity fill:#e8f5f3,stroke:#0f766e,stroke-width:3px,color:#102a2a,font-weight:bold;
  classDef key fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#102a2a;
  classDef numeric fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#102a2a;
  class leave_balances entity;
  class employee_id,balance_key key;
  class allocated,available,used,carry_forward numeric;
```

Store every balance field as a DynamoDB Number. Pending requests do not consume balance; charge paid leave only after final approval. `UNPAID`/loss-of-pay requests should not decrement paid leave balances.
