# Setup Guide

> ⚠️ **CRITICAL**: This project has never been built or had dependencies installed. These setup instructions are essential to make it functional for the first time.

## 🚨 Current State

This project is **source code only** - it has never been:
- Had dependencies installed (no package-lock.json)
- Built for distribution (no dist/ directory)
- Tested with actual dependencies
- Used as a GitHub Action

You are essentially performing the initial setup that should have been done before the first commit.

## 📋 Prerequisites

Ensure you have:
- **Node.js 18+** (required by package.json)
- **npm 9+** (for modern package management)
- **Git** (for version control)

Verify your versions:
```bash
node --version  # Should be v18.x.x or higher
npm --version   # Should be 9.x.x or higher
```

## 🔧 Step-by-Step Setup Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/gh-workflow-issue-creator.git
cd gh-workflow-issue-creator
```

### Step 2: Install Dependencies (FIRST TIME)

**IMPORTANT**: Do NOT use `npm ci` - it will fail because no package-lock.json exists!

```bash
# This creates package-lock.json for the first time
npm install
```

Expected outcome:
- Creates `package-lock.json` file
- Installs all dependencies in `node_modules/`
- May show some warnings (document them)

Possible issues:
- Dependency conflicts (document and report)
- Version incompatibilities (try with different Node versions)

### Step 3: Verify Tests Work

```bash
npm test
```

Expected outcome:
- Tests should run with Vitest
- Coverage report should generate
- All tests should pass (only 4 test files exist, very minimal)

Possible issues:
- Import errors (TypeScript configuration issues)
- Test framework setup problems
- Coverage tool issues

If tests fail, document:
1. Exact error messages
2. Which tests fail
3. Stack traces

### Step 4: Build the Distribution

```bash
npm run build
```

Expected outcome:
- Creates `dist/` directory
- Generates `dist/index.js` (bundled with ncc)
- May generate source maps

Possible issues:
- TypeScript compilation errors
- Bundling errors with @vercel/ncc
- Missing type definitions

### Step 5: Verify the Build

```bash
# Check that required files exist
ls -la dist/index.js
```

The `dist/index.js` file must exist for the action to work (see action.yml line 109).

### Step 6: Test Locally (Optional)

Create a test workflow file `.github/workflows/test.yml`:

```yaml
name: Test Action
on: push

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Test the action
        uses: ./
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          mode: create
          category: general
```

**Note**: This will only work after dist/ is committed!

### Step 7: Commit the Setup Files

If everything works:

```bash
# Add the essential files
git add package-lock.json
git add dist/

# Commit them
git commit -m "feat: initial project setup - add dependencies and build artifacts"

# Push to a branch
git checkout -b fix/initial-setup
git push origin fix/initial-setup
```

## 🐛 Troubleshooting

### npm install fails

Try:
- Clear npm cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules`
- Use different Node version (try v20)

### Tests won't run

Check:
- TypeScript config: `tsconfig.json`
- Vitest config: `vitest.config.ts`
- Import paths in test files

### Build fails

Common issues:
- TypeScript errors - fix type issues in source
- Missing dependencies - check package.json
- ncc bundling issues - check ncc compatibility

### Action won't run

Ensure:
- `dist/index.js` exists and is committed
- `action.yml` points to correct file (line 109)
- All required inputs are provided

## 📊 Validation Checklist

After setup, verify:

- [ ] `package-lock.json` exists
- [ ] `node_modules/` directory exists (locally)
- [ ] `npm test` runs without errors
- [ ] Test coverage generates
- [ ] `npm run build` completes successfully
- [ ] `dist/index.js` exists
- [ ] `npm run lint` passes
- [ ] No TypeScript errors

## 🚀 Next Steps

Once setup is complete:

1. **Test in Real Workflow**: Create a test repository and use the action
2. **Document Issues**: Create GitHub issues for any problems found
3. **Fix Problems**: Submit PRs to fix discovered issues
4. **Update Docs**: Update README once the action actually works

## 💡 Tips for First-Time Setup

1. **Document Everything**: Keep notes on what works/fails
2. **Check Versions**: Ensure Node/npm versions match requirements
3. **Read Errors Carefully**: TypeScript and build errors often have helpful messages
4. **Ask for Help**: Create issues if you get stuck
5. **Small Steps**: Get each step working before moving on

## 🆘 Getting Help

If you encounter issues:

1. Check existing [GitHub Issues](https://github.com/your-org/gh-workflow-issue-creator/issues)
2. Create a new issue with:
   - Step where it failed
   - Complete error message
   - Node/npm versions
   - Operating system
3. Join [Discussions](https://github.com/your-org/gh-workflow-issue-creator/discussions)

## 📝 Contributing Your Setup Experience

After going through setup, please:
- Document any issues you encountered
- Share solutions you found
- Update this guide with clarifications
- Help others facing similar problems

Remember: Your setup struggles help improve the project for everyone!

---

<div align="center">

**First Time Setup • Building from Source • Making It Work**

*This is not a normal setup - you're essentially completing the initial project configuration that was never done.*

</div>