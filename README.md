# GH-Workflow-Issue-Creator

[![CI](https://github.com/your-org/gh-workflow-issue-creator/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/gh-workflow-issue-creator/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Create or update a GitHub issue whenever a workflow fails. Smart deduplication (stable fingerprint), category-aware templates, and AI-friendly formatting help humans and agents fix failures fast. Built with TypeScript, Vitest, and ncc.

## ✨ Features

- 🔍 **Smart Deduplication**: Stable fingerprints prevent duplicate issues for recurring failures
- 📝 **Category Templates**: Pre-built templates for common failure types (tests, security, terraform, deployment)
- 🤖 **AI-Friendly**: Structured output that agents like GitHub Copilot can parse and act on
- 🔒 **Secure**: Automatic redaction of secrets, tokens, and sensitive data
- ✅ **Auto-Close**: Companion mode closes issues when builds turn green
- 📦 **Cross-Repository**: Create issues in a different repository for centralized tracking

## 🚀 Quick Start

### Basic Usage

```yaml
name: CI

on: [push, pull_request]

permissions:
  contents: read
  actions: read
  issues: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test

  issue-on-failure:
    needs: [build]
    if: failure()
    runs-on: ubuntu-latest
    steps:
      - uses: your-org/GH-Workflow-Issue-Creator@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Close Issues on Success

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test

  close-on-success:
    needs: [build]
    if: success()
    runs-on: ubuntu-latest
    steps:
      - uses: your-org/GH-Workflow-Issue-Creator@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          mode: close-on-success
```

## 📋 Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `github-token` | ✅ | - | GitHub token for API access |
| `mode` | | `create` | `create` or `close-on-success` |
| `category` | | `general` | Issue category (auto-detected if enabled) |
| `auto-detect-category` | | `true` | Auto-detect category from workflow name |
| `dedupe-strategy` | | `fingerprint` | `fingerprint` or `none` |
| `failure-label` | | `workflow-failure` | Primary label for issues |
| `additional-labels` | | | Comma-separated extra labels |
| `assignees` | | | Comma-separated usernames |
| `target-owner` | | | Cross-repo: target owner |
| `target-repo` | | | Cross-repo: target repository |
| `body-template` | | | Inline Mustache template |
| `body-template-path` | | | Path to template file |
| `include-logs` | | `false` | Include error log excerpts |
| `max-issues-per-workflow` | | `3` | Cap on open issues |
| `snooze-until` | | | ISO date to delay creation |
| `copilot-optimized` | | `true` | AI-friendly output structure |

## 📤 Outputs

| Output | Description |
|--------|-------------|
| `issue-number` | Created/updated issue number |
| `issue-url` | Issue HTML URL |
| `fingerprint` | Stable fingerprint of this failure |
| `deduped` | `true` if an existing issue was updated |
| `resolved` | `true` if close-on-success closed an issue |
| `detected-category` | Auto-detected category |

## 🏷️ Categories

The action automatically detects the category based on workflow and job names:

| Category | Detected When |
|----------|--------------|
| `terraform-validation` | Workflow contains "terraform" |
| `security-scan` | Contains "security", "codeql", "snyk" |
| `infrastructure-deployment` | Contains "deploy", "release" |
| `code-quality` | Contains "test", "lint", "build" |
| `general` | Default fallback |

Each category uses a specialized template with relevant troubleshooting steps.

## 🔒 Security

### Automatic Redaction

The action automatically redacts sensitive data from issue bodies:

- API keys and tokens (GitHub, npm, AWS, etc.)
- Passwords and secrets
- Private keys (SSH, PEM)
- Database connection strings
- Credit card numbers
- JWTs

### Required Permissions

```yaml
permissions:
  contents: read    # For checkout
  actions: read     # For workflow context
  issues: write     # For creating/updating issues
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/gh-workflow-issue-creator.git
cd gh-workflow-issue-creator

# Install dependencies
npm install

# Run tests
npm test

# Build the action
npm run build
```

### Project Structure

```
gh-workflow-issue-creator/
├── src/
│   ├── index.ts              # Main entry point
│   └── lib/
│       ├── config.ts         # Input validation (Zod)
│       ├── context.ts        # GitHub context builder
│       ├── category.ts       # Category auto-detection
│       ├── fingerprint.ts    # Stable fingerprint computation
│       ├── render.ts         # Mustache template rendering
│       ├── issue-manager.ts  # Issue CRUD operations
│       └── redact.ts         # Sensitive data redaction
├── tests/                    # Test files
├── templates/                # Issue templates
├── dist/                     # Built action (generated)
└── action.yml                # Action definition
```

### Scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run tests with coverage |
| `npm run build` | Bundle for distribution |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run check` | Lint + test |
| `npm run test:e2e` | Run E2E tests |

## 📚 Examples

See the [examples/](examples/) directory for more usage patterns:

- [Workflow Run Trigger](examples/workflow-run.yml)
- [Close on Success](examples/close-on-success.yml)
- [Inline Failure Handling](examples/inline-failure.yml)
- [Cross-Repository Triage](examples/cross-repo-triage.yml)

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run `npm run check`
5. Submit a pull request

## 📄 License

MIT - See [LICENSE](LICENSE) for details.

## 🔗 Links

- [Configuration Reference](docs/CONFIGURATION_REFERENCE.md)
- [Security Policy](SECURITY.md)
- [Roadmap](ROADMAP.md)
- [Decisions Log](DECISIONS.md)

---

<div align="center">

**Automatically track workflow failures • Smart deduplication • AI-ready**

[Report Bug](https://github.com/your-org/gh-workflow-issue-creator/issues) • [Request Feature](https://github.com/your-org/gh-workflow-issue-creator/discussions) • [Documentation](docs/)

</div>
