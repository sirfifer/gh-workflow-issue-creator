# Configuration reference

All inputs map to environment-backed options with sane defaults.

| Input | Type | Default | Notes |
| --- | --- | --- | --- |
| `mode` | enum | `create` | or `close-on-success` |
| `run-id` | string | (from context) | Use with `workflow_run` triggers |
| `category` | string | `general` | If `auto-detect-category` is true, this is fallback |
| `auto-detect-category` | bool | `true` | regex-based |
| `dedupe-strategy` | enum | `fingerprint` | or `none` |
| `failure-label` | string | `workflow-failure` | applied to every issue |
| `additional-labels` | string |  | comma-separated |
| `assignees` | string |  | comma-separated usernames |
| `target-owner` | string |  | cross-repo |
| `target-repo` | string |  | cross-repo |
| `auth-mode` | enum | `default` | or `pat` |
| `body-template` | string |  | inline Mustache |
| `body-template-path` | string |  | file path |
| `body-template-mode` | enum | `replace` | or `merge` |
| `include-logs` | bool | `false` | future: excerpt & redact |
| `max-issues-per-workflow` | number | `3` | soft cap |
| `rate-limit-hours` | number | `24` | per-fingerprint backoff |
| `always-create-new` | bool | `false` | bypass dedupe |
| `config-path` | string | `.github/workflow-issue-creator.yml` | repo-level defaults |
| `copilot-optimized` | bool | `true` | structured sections |
| `consolidated-mode` | bool | `false` | accept step JSON |
| `snooze-until` | ISO date |  | skip until date |
