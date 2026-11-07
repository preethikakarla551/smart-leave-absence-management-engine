# `leave_type_config` table

```mermaid
flowchart LR
  leave_type_id([leave_type_id · String · PK]) --> leave_type_config[LEAVE_TYPE_CONFIG]
  annual_quota([annual_quota · Number]) --> leave_type_config
  carry_forward_max([carry_forward_max · Number]) --> leave_type_config
  is_unlimited([is_unlimited · Boolean]) --> leave_type_config
  hr_threshold([HR approval threshold · Number · field name verify]) --> leave_type_config
  classDef entity fill:#e8f5f3,stroke:#0f766e,stroke-width:3px,color:#102a2a,font-weight:bold;
  classDef key fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#102a2a;
  class leave_type_config entity;
  class leave_type_id key;
```

Configured leave types shown in the console: `SICK`, `CASUAL`, `EARNED`, and `UNPAID`. Confirm the exact HR-threshold attribute name against the Lambda code; the console screenshot showed the start of its name but not the full label.
