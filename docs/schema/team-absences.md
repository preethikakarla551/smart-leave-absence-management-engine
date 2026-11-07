# `team_absences` table

```mermaid
flowchart LR
  primary_key([Primary key · verify in AWS]) --> team_absences[TEAM_ABSENCES]
  sort_key([Sort key · verify in AWS]) --> team_absences
  approved_employee([Approved employee absence fields · confirm]) --> team_absences
  classDef entity fill:#e8f5f3,stroke:#0f766e,stroke-width:3px,color:#102a2a,font-weight:bold;
  classDef key fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#102a2a;
  class team_absences entity;
  class primary_key,sort_key key;
```

The table name appears in backend configuration, but its keys and item attributes were not visible in the available Console screenshots. Fill this diagram from DynamoDB → Tables → `team_absences` → **General information** and **Indexes** before treating it as final.
