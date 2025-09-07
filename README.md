# GH-Workflow-Issue-Creator

[![Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](https://www.repostatus.org/badges/latest/wip.svg)](https://www.repostatus.org/#wip)
[![GitHub issues](https://img.shields.io/github/issues/your-org/gh-workflow-issue-creator)](https://github.com/your-org/gh-workflow-issue-creator/issues)
[![GitHub discussions](https://img.shields.io/github/discussions/your-org/gh-workflow-issue-creator)](https://github.com/your-org/gh-workflow-issue-creator/discussions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 🚧 **Pre-Alpha Software**: This project is NOT YET FUNCTIONAL. The source code is written but the project hasn't been built or packaged. We're building in public - star the repo to follow our progress toward a working release!

Create or update a GitHub issue whenever a workflow fails. Smart deduplication (stable fingerprint), category-aware templates, and AI-friendly formatting help humans and agents fix failures fast. Built with a 100% build-to-test philosophy and mature tooling (TypeScript, Vitest, ncc).

## ⚠️ Critical Setup Required

**This action does not work yet!** The code is written but critical setup steps haven't been completed:

### What's Missing
- ❌ **No package-lock.json** - Dependencies have never been installed
- ❌ **No dist/ directory** - Action hasn't been built for distribution
- ❌ **Not runnable** - Cannot be used as a GitHub Action in current state
- ❌ **Tests don't run** - Dependencies missing, coverage unknown

### To Make This Work
If you want to help get this project functional:
```bash
# 1. Install dependencies (creates package-lock.json)
npm install

# 2. Run tests to verify code
npm test

# 3. Build the distribution
npm run build

# 4. Commit the package-lock.json and dist/ directory
```

See [SETUP.md](SETUP.md) for detailed setup instructions.

## 📍 Current Project Status

### Actual State (Reality Check)
- 📝 **Source Code**: Complete - all features coded
- 🚫 **Build Status**: NOT BUILT - missing dist/ directory
- 🚫 **Dependencies**: NOT INSTALLED - no package-lock.json
- 🚫 **Tests**: CANNOT RUN - dependencies missing
- 🚫 **Usability**: ZERO - cannot be used as GitHub Action
- 📚 **Documentation**: Written optimistically for future state

### What's Actually Implemented (in code)
- ✅ Issue creation/update logic
- ✅ Fingerprint-based deduplication
- ✅ Category detection and templates
- ✅ Close-on-success mode
- ✅ Cross-repository support
- ✅ Configuration system
- ✅ Template rendering with Mustache

### What's Needed Before First Use
1. Install dependencies (`npm install`)
2. Verify tests pass (`npm test`)
3. Build distribution (`npm run build`)
4. Test in actual GitHub Action workflow
5. Fix any runtime issues discovered

## 🎯 Planned Features (When Built)

Once this project is properly built and tested, it will provide:

- 🔍 **Smart Deduplication**: Stable fingerprints prevent duplicate issues
- 📝 **Category Templates**: Pre-built templates for common failure types
- 🤖 **AI-Friendly**: Structured output that agents can parse and act on
- 🔒 **Secure**: Works with `GITHUB_TOKEN` or fine-grained PAT
- 📦 **Minimal Dependencies**: Fast runtime with bundled distribution
- ✅ **Auto-Close**: Companion mode closes issues when builds turn green

## 🚀 How It Will Work (Future)

Once built and functional, usage will look like:

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

## 🤝 Contributing

We need help getting this project from code to working action! Whether you're helping with the build process, testing, or documentation, your contribution matters.

### Immediate Help Needed
1. **Build the project** - Get dist/ directory created
2. **Test the build** - Verify it works in a workflow
3. **Document issues** - Report what breaks
4. **Fix problems** - Help resolve build/runtime issues

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## 🛠️ Development

### Current Blockers
```bash
# THIS DOESN'T WORK YET:
npm ci  # Fails - no package-lock.json exists

# NEED TO DO THIS FIRST:
npm install  # Creates package-lock.json
npm test     # Verify tests work
npm run build # Create dist/ directory
```

### Project Structure
```
gh-workflow-issue-creator/
├── src/              # ✅ Source code (complete)
│   ├── index.ts      # ✅ Main entry point
│   └── lib/          # ✅ Core functionality
├── tests/            # ⚠️ Test files (minimal)
├── templates/        # ✅ Issue templates
├── examples/         # ✅ Usage examples
├── dist/             # ❌ MISSING - needs build
├── package.json      # ✅ Exists
└── package-lock.json # ❌ MISSING - needs npm install
```

## 📊 Project Transparency

Honest assessment of where we are:

| Metric | Status |
|--------|--------|
| **Development Stage** | Pre-Alpha (unbuildable) |
| **Source Code** | 100% written |
| **Build Artifacts** | 0% (missing dist/) |
| **Dependencies** | Not installed |
| **Test Coverage** | Unknown (can't run) |
| **Production Ready** | Absolutely not |
| **Can Be Used** | No |
| **Time to Functional** | ~1-2 hours of setup work |

### Why This State?

This appears to be an initial code commit without the build/setup phase completed. The source code is present but the project hasn't gone through the steps needed to make it actually usable as a GitHub Action.

## 🗺️ Realistic Roadmap

See [ROADMAP.md](ROADMAP.md) for detailed plans.

### Immediate Priority: Make It Work
1. Install dependencies
2. Run and fix tests
3. Build distribution
4. Test in real workflow
5. Fix discovered issues
6. Create first working release

### Then: Claimed Features
After we have a working build, we can verify and improve the features already coded.

## 🙏 Acknowledgments

### The Code That Exists
Thanks to whoever wrote the initial source code. Now we need to make it run!

### Future Contributors
If you help get this working, you'll be helping teams worldwide handle CI/CD failures better.

## 📢 Stay Updated

- ⭐ **Star this repo** to follow progress toward functionality
- 👁️ **Watch for updates** on when this becomes usable
- 💬 **Join discussions** about getting this working
- 🔨 **Help build** what's missing

## ⚡ Quick Status Check

```bash
# Run this to see what's missing:
ls dist/ 2>/dev/null && echo "✅ Built" || echo "❌ Not built"
ls package-lock.json 2>/dev/null && echo "✅ Dependencies locked" || echo "❌ No lock file"
npm test 2>/dev/null && echo "✅ Tests pass" || echo "❌ Tests don't run"
```

Current result: All ❌

## 📝 License

MIT - See [LICENSE](LICENSE) for details.

---

<div align="center">

**Building in Public • Currently Broken • Help Us Fix It**

*This README accurately reflects the current non-functional state. When the project works, we'll update this!*

[Report Issue](https://github.com/your-org/gh-workflow-issue-creator/issues) • [Start Discussion](https://github.com/your-org/gh-workflow-issue-creator/discussions) • [View Setup Guide](SETUP.md)

</div>