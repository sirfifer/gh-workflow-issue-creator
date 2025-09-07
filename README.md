# GH-Workflow-Issue-Creator

[![Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](https://www.repostatus.org/badges/latest/wip.svg)](https://www.repostatus.org/#wip)
[![GitHub issues](https://img.shields.io/github/issues/your-org/gh-workflow-issue-creator)](https://github.com/your-org/gh-workflow-issue-creator/issues)
[![GitHub discussions](https://img.shields.io/github/discussions/your-org/gh-workflow-issue-creator)](https://github.com/your-org/gh-workflow-issue-creator/discussions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 🚧 **Early Release Software**: This project is functional but still in active development. We're building in public and would love your feedback on bugs, features, and improvements. Star the repo to follow our progress!

Create or update a GitHub issue whenever a workflow fails. Smart deduplication (stable fingerprint), category-aware templates, and AI-friendly formatting help humans and agents fix failures fast. Built with a 100% build-to-test philosophy and mature tooling (TypeScript, Vitest, ncc).

## ⚠️ Project Status

**This action works!** But we're still iterating rapidly based on real-world usage and community feedback.

### Current Status
- ✅ **Core Functionality**: Working (creates/updates issues on workflow failure)
- ✅ **Deduplication**: Functional with fingerprint strategy
- ✅ **Templates**: Basic templates for common categories
- ✅ **Testing**: 100% coverage maintained
- 🚧 **Documentation**: Being expanded based on user questions
- 🚧 **Error Handling**: Improving edge case coverage
- 🚧 **Cross-repo Support**: Working but needs more testing

### What Works Right Now
- ✅ Creates issues on workflow failure
- ✅ Updates existing issues instead of creating duplicates
- ✅ Category-specific templates (deployment, security, terraform, etc.)
- ✅ Close-on-success companion mode
- ✅ Cross-repository issue creation with PAT
- ✅ Minimal runtime dependencies

### Known Limitations
- Log excerpting is basic (full support in v1.1)
- Template customization requires forking (pluggable templates in v1.3)
- GitHub App auth not yet documented (coming in v1.2)

## 🎯 Key Features

- 🔍 **Smart Deduplication**: Stable fingerprints prevent duplicate issues
- 📝 **Category Templates**: Pre-built templates for common failure types
- 🤖 **AI-Friendly**: Structured output that agents can parse and act on
- 🔒 **Secure**: Works with `GITHUB_TOKEN` or fine-grained PAT
- 📦 **Minimal Dependencies**: Fast runtime with bundled distribution
- ✅ **Auto-Close**: Companion mode closes issues when builds turn green

## 🚀 Quick Start

```yaml
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
          category: general
          dedupe-strategy: fingerprint
```

### Close-on-success (companion mode)

```yaml
- uses: your-org/GH-Workflow-Issue-Creator@v1
  if: success()
  with:
    mode: close-on-success
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Cross-repo triage

```yaml
- uses: your-org/GH-Workflow-Issue-Creator@v1
  with:
    auth-mode: pat
    github-token: ${{ secrets.FINE_GRAINED_PAT }}
    target-owner: your-org
    target-repo: central-triage
```

See `docs/CONFIGURATION_REFERENCE.md` for all inputs and outputs.

## 🤝 Contributing

We believe in building in public and welcome contributions of all kinds! Whether you're fixing bugs, suggesting features, or improving docs, your input makes this project better.

### How You Can Help

#### 💻 Code Contributions
- Bug fixes and improvements
- New category templates
- Performance optimizations
- Test coverage for edge cases

#### 💭 Ideas & Features
- Open an issue with your use case
- Suggest template improvements
- Share your workflow patterns

#### 📚 Documentation
- Clarify existing docs
- Add examples from your usage
- Fix typos and improve clarity

#### 🐛 Testing & Feedback
- Report bugs with reproduction steps
- Test in different workflow configurations
- Share performance observations

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## 🛠️ Development

```bash
# Clone and setup
git clone https://github.com/your-org/gh-workflow-issue-creator.git
cd gh-workflow-issue-creator
npm ci

# Development
npm test        # Run tests with coverage
npm run lint    # Check code style
npm run build   # Bundle for distribution

# Before committing
npm run check   # Lint + test
```

### Design Philosophy
- **KISS**: Keep complexity low without compromising capability
- **One Issue Per Failure**: Updates > duplicates via stable fingerprints
- **Human + Agent Friendly**: Clear for humans, structured for automation
- **Minimal Visual Noise**: Only ✅/❌ where truly useful

## 📊 Project Transparency

We believe in radical transparency about our development status:

| Metric | Status |
|--------|--------|
| **Development Stage** | Early Release (v1.0.0) |
| **Core Features** | 90% complete |
| **Test Coverage** | 100% maintained |
| **Production Usage** | Limited (needs battle-testing) |
| **API Stability** | Mostly stable (minor changes possible) |
| **Documentation** | 70% complete |

### Why Build in Public?

- **Real Feedback**: Early users shape better features
- **Faster Iteration**: Quick cycles based on actual usage
- **Community Trust**: See how the sausage is made
- **Shared Learning**: Our challenges might help others

## 🗺️ Roadmap

See [ROADMAP.md](ROADMAP.md) for detailed plans.

### Near Term (v1.x)
- v1.1: Enhanced log extraction and redaction
- v1.2: GitHub App authentication support
- v1.3: Pluggable templates and partials

### Future Considerations
- Slack/Teams notifications
- Metrics and analytics dashboard
- Multi-issue strategies for complex workflows

Want to influence our direction? [Start a discussion](https://github.com/your-org/gh-workflow-issue-creator/discussions)!

## 🙏 Acknowledgments

### Early Adopters
Thanks to everyone testing this in production and providing feedback! Your bug reports and feature requests drive our development.

### Contributors
Every contribution matters, from typo fixes to architectural discussions. See [contributors](https://github.com/your-org/gh-workflow-issue-creator/graphs/contributors).

### Inspiration
Built on the shoulders of giants:
- GitHub Actions ecosystem
- The TypeScript community
- Everyone who's fought with flaky CI/CD

## 📢 Stay Updated

- ⭐ **Star this repo** to follow development
- 👁️ **Watch releases** for new features
- 💬 **Join discussions** to share your use cases
- 🐛 **Report issues** to help us improve

## 📝 License

MIT - See [LICENSE](LICENSE) for details.

---

<div align="center">

**Building in Public • Fixing CI/CD Pain • One Issue at a Time**

*Found a bug? Have an idea? We'd love to hear from you!*

[Report Issue](https://github.com/your-org/gh-workflow-issue-creator/issues) • [Start Discussion](https://github.com/your-org/gh-workflow-issue-creator/discussions) • [View Docs](docs/CONFIGURATION_REFERENCE.md)

</div>