# {{workflow.name}} failure

**Repository:** {{context.repository}}  
**Run:** {{context.run_url}}  
**Commit:** [`{{context.sha_short}}`]({{context.commit_url}})  
**Actor:** @{{context.actor}}  
**Branch:** `{{context.ref_name}}`

## Summary (for humans)
A failure was detected in **{{workflow.job}}** within workflow **{{workflow.name}}**.  
Category: `{{validation.issue_category}}`  
Fingerprint: `{{fingerprint}}`

## Steps to reproduce
```bash
{{validation.reproduce_command}}
```

## Validation after fix
```bash
{{validation.validate_command}}
```

## Signals
- PR? {{context.is_pull_request}}
- Main branch? {{context.is_main_branch}}
- Event: {{context.event_name}}
- Time: {{context.timestamp}}

---
**Agent scope:** Fix the failure described above and re-run the workflow.  
❌ **Status:** failing • Designed to close automatically on success (companion mode)  
