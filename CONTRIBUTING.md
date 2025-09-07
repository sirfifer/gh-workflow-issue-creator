# Contributing to GH-Workflow-Issue-Creator

Welcome! We're thrilled you're interested in contributing. This project aims for a crisp DX and a strong test culture, and we believe the best software is built by diverse teams with varied perspectives.

## 📢 Current Contribution Status

**We're accepting all contributions!** This project is in active development and benefits greatly from community input. Whether you're fixing a typo, adding a feature, or redesigning architecture, we want to hear from you.

### Why We Build in Public

- **Transparency**: See exactly how decisions are made and features are built
- **Learning**: Our successes and mistakes can help others
- **Community**: Better software through diverse perspectives
- **Momentum**: Public accountability keeps us shipping

## 🎯 How You Can Contribute

### 💻 Code Contributions

We welcome code contributions of all sizes! Here's how:

1. **Check existing issues** or create a new one to discuss your idea
2. **Fork the repository** and create a feature branch
3. **Write your code** following our conventions (see below)
4. **Add/update tests** to maintain 100% coverage
5. **Submit a PR** with a clear description

#### What We're Looking For
- Bug fixes (even tiny ones!)
- New category templates for different failure types
- Performance improvements
- Better error messages and handling
- Test coverage for edge cases
- Accessibility improvements

### 💭 Ideas & Feature Requests

Not ready to code? Your ideas are valuable!

- **Open an issue** describing your use case
- **Start a discussion** for broader topics
- **Comment on existing issues** with your perspective
- **Share your workflow patterns** that could benefit others

### 📚 Documentation

Documentation is crucial for adoption and usability:

- Fix typos and clarify confusing sections
- Add examples from your own usage
- Translate documentation (open an issue first)
- Improve inline code comments
- Create tutorials or blog posts (let us know!)

### 🐛 Testing & Bug Reports

Help us make this rock-solid:

- Report bugs with detailed reproduction steps
- Test in different GitHub Actions environments
- Try edge cases and unusual configurations
- Performance testing with large workflows
- Security testing (please report privately first)

### 🎨 Design & UX

- Suggest improvements to issue templates
- Propose better error messages
- Design new template categories
- Improve CLI output formatting

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm 9+
- Git

### Local Development

```bash
# Fork and clone your fork
git clone https://github.com/YOUR-USERNAME/gh-workflow-issue-creator.git
cd gh-workflow-issue-creator

# Add upstream remote
git remote add upstream https://github.com/your-org/gh-workflow-issue-creator.git

# Install dependencies
npm ci

# Create a feature branch
git checkout -b feature/your-feature-name

# Start development
npm run dev          # Watch mode for TypeScript
npm test -- --watch  # Watch mode for tests
```

### Before Submitting

```bash
# Run all checks
npm run check  # Runs lint + test

# Individual checks
npm run lint   # ESLint
npm test       # Vitest with coverage (must stay 100%)
npm run build  # Bundle with ncc

# Format code
npm run format
```

## 📋 Coding Standards

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Prefer functional programming where sensible
- Add JSDoc comments for public APIs

### Testing
- **100% coverage is required** - no exceptions
- Write tests before or alongside code
- Mock external dependencies (GitHub API, file system)
- Test both happy and error paths
- Use descriptive test names that explain the "why"

### Commits
We use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `test:` Test additions or fixes
- `refactor:` Code restructuring
- `perf:` Performance improvements
- `chore:` Maintenance tasks

Examples:
```
feat: add terraform category template
fix: handle rate limit errors gracefully
docs: clarify PAT permissions needed
test: add edge cases for fingerprint generation
```

### Pull Requests
- **Keep PRs focused** - one feature/fix per PR
- **Size matters** - aim for <500 lines changed
- **Description** - explain the why, not just the what
- **Screenshots** - include for visual changes
- **Link issues** - use "Fixes #123" in description
- **Update docs** - if adding features or changing behavior

#### PR Template
```markdown
## Problem
Brief description of what problem this solves

## Solution
How this PR addresses the problem

## Testing
How you tested these changes

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Coverage remains 100%
```

## 🔄 Development Workflow

1. **Discuss First** (for major changes)
   - Open an issue or discussion
   - Get feedback on approach
   - Prevents wasted effort

2. **Branch Strategy**
   - Branch from `main`
   - Use descriptive branch names: `feature/`, `fix/`, `docs/`
   - Keep branches up-to-date with upstream

3. **Test Driven Development**
   - Write failing test
   - Write minimal code to pass
   - Refactor and repeat

4. **Code Review Process**
   - All code needs review
   - Address feedback constructively
   - Reviews usually within 48 hours

## 🎯 What Makes a Good Contribution?

### ✅ Great Contributions
- Solve real problems users face
- Include thorough tests
- Have clear, helpful error messages
- Follow existing patterns
- Include documentation updates

### ❌ Contributions We May Decline
- Massive refactors without discussion
- Features that complicate core use cases
- Changes that break backward compatibility
- Code without tests
- Unnecessarily complex solutions

## 🤝 Community Guidelines

### Be Excellent to Each Other
- Respectful communication always
- Assume positive intent
- Be patient with newcomers
- Celebrate contributions of all sizes

### Getting Help
- Check existing issues and discussions
- Read the documentation
- Ask in discussions for general questions
- Open issues for bugs or features

## 🎖️ Recognition

We value every contribution:
- Contributors are listed in our README
- Significant contributors get commit access
- We highlight community contributions in releases
- Your work helps teams worldwide handle CI/CD failures better

## 📬 Contact

- **Issues**: [GitHub Issues](https://github.com/your-org/gh-workflow-issue-creator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/gh-workflow-issue-creator/discussions)
- **Security**: See [SECURITY.md](SECURITY.md) for reporting vulnerabilities

## 🚀 Release Process

We use semantic versioning and automated releases:
1. PRs merged to `main` trigger CI
2. Conventional commits determine version bump
3. Automated changelog generation
4. NPM and GitHub releases created

Your contributions could be in the next release!

---

**Thank you for contributing! Every improvement, no matter how small, makes this project better for everyone.** 🙏