# Code quality failure — {{workflow.name}}

This failure appears to be a **code-quality** problem (lint/tests/coverage).  
Fingerprint: `{{fingerprint}}`

## Suggested investigation
1. Re-run locally:
```bash
npm test
```
2. Check linter output and failing test files.
3. Update tests and rules as needed.

✅ When fixed, push to the same branch and re-run CI.
