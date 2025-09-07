# Roadmap

> 🗺️ **Living Document**: This roadmap evolves based on user feedback and real-world usage. Want to influence our direction? [Start a discussion](https://github.com/your-org/gh-workflow-issue-creator/discussions)!

## 🎯 Vision

Create the most reliable and developer-friendly GitHub Action for turning CI/CD failures into actionable issues, with smart deduplication and templates that work for both humans and AI agents.

## 📍 Current Status: Phase 1 Complete ✅

We've successfully launched v1.0.0 with core functionality working! Now we're gathering feedback and iterating based on real usage.

## 🚀 Development Phases

### ✅ Phase 0: Foundation (Complete)
- [x] Core action structure with TypeScript
- [x] Basic issue creation on workflow failure
- [x] Fingerprint-based deduplication
- [x] Category-aware templates (general, deployment, security, terraform, code-quality)
- [x] 100% test coverage with Vitest
- [x] GitHub Actions integration
- [x] Minimal runtime dependencies

### ✅ Phase 1: MVP Release (Complete - v1.0.0)
- [x] Stable fingerprint generation
- [x] Issue update instead of duplicate creation
- [x] Close-on-success companion mode
- [x] Cross-repository issue creation with PAT
- [x] Comprehensive documentation
- [x] GitHub Marketplace submission ready

### 🚧 Phase 2: Enhanced Intelligence (Current - v1.1)
**Target: Q1 2025**
- [ ] Smart log extraction with context
- [ ] Log redaction for sensitive data
- [ ] Category-specific error parsing
- [ ] Improved error pattern recognition
- [ ] Performance metrics in issues
- [ ] Better handling of matrix job failures

### 📋 Phase 3: Developer Experience (v1.2)
**Target: Q2 2025**
- [ ] GitHub App authentication support
- [ ] Interactive configuration wizard
- [ ] VS Code extension for template editing
- [ ] Template validation CLI tool
- [ ] Migration tool from other issue creators
- [ ] Detailed troubleshooting guide

### 🔧 Phase 4: Customization Power (v1.3)
**Target: Q2 2025**
- [ ] Pluggable template system
- [ ] Custom partials and helpers
- [ ] Template marketplace/registry
- [ ] YAML-based template definitions
- [ ] Runtime template selection logic
- [ ] Template inheritance and composition

### 🌟 Phase 5: Advanced Features (v2.0)
**Target: Q3 2025**
- [ ] AI-powered root cause analysis
- [ ] Suggested fixes based on patterns
- [ ] Integration with error tracking services
- [ ] Workflow failure trends dashboard
- [ ] Slack/Teams/Discord notifications
- [ ] Automatic PR creation for known fixes

## 🎯 Near-Term Priorities (Next 3 Months)

Based on early user feedback, we're prioritizing:

1. **Better Log Handling** (v1.1.0)
   - Smarter excerpt selection
   - Automatic secret redaction
   - Collapsible sections for long logs

2. **Template Improvements** (v1.1.x)
   - More built-in categories
   - Better variable documentation
   - Example templates repository

3. **Performance** (v1.1.x)
   - Faster fingerprint generation
   - Reduced API calls
   - Caching strategies

## 💡 Future Ideas (Backlog)

These are ideas we're exploring based on community interest:

- **Multi-Issue Strategies**: Create separate issues for different failure types in one workflow
- **Issue Templates as Code**: Define templates in your repository
- **Failure Analytics**: Track patterns across workflows and repositories
- **ChatOps Integration**: Manage issues through Slack/Teams commands
- **Automatic Retries**: Retry failed jobs before creating issues
- **Cost Analysis**: Include GitHub Actions usage costs in issues
- **Dependencies Graph**: Show which failures block other workflows
- **SLA Tracking**: Monitor time-to-resolution for different failure types

## 📊 Success Metrics

We measure success by:
- **Adoption**: Active installations and usage
- **Reliability**: Uptime and successful issue creation rate
- **Performance**: Action execution time
- **Community**: Contributors and engagement
- **Impact**: Time saved debugging CI/CD failures

## 🤝 Get Involved

### How to Influence the Roadmap

1. **Vote on Ideas**: 👍 on issues for features you want
2. **Share Use Cases**: Describe your workflow needs
3. **Contribute Code**: Pick up "good first issue" items
4. **Test Early Releases**: Try beta versions and provide feedback
5. **Sponsor Development**: Support maintainers

### Current Focus Areas Needing Help

- 🧪 **Testing**: Real-world workflow scenarios
- 📝 **Templates**: Industry-specific categories
- 🌍 **Localization**: Multi-language support
- 📚 **Documentation**: Tutorials and examples
- 🔍 **Research**: Failure pattern analysis

## 📅 Release Schedule

- **Patch Releases** (x.x.X): As needed for bug fixes
- **Minor Releases** (x.X.0): Monthly with new features
- **Major Releases** (X.0.0): Quarterly with significant changes

All releases follow semantic versioning and include:
- Detailed changelog
- Migration guide (if needed)
- Updated documentation

## 🔄 Revision History

- **2024-12-14**: Initial roadmap with 5 phases
- **2025-01-10**: Updated after v1.0.0 release
- **[Next Update]**: After v1.1.0 release

---

<div align="center">

**Your Feedback Shapes Our Future**

[Suggest a Feature](https://github.com/your-org/gh-workflow-issue-creator/issues/new?labels=enhancement) • [Join Discussion](https://github.com/your-org/gh-workflow-issue-creator/discussions) • [View Milestones](https://github.com/your-org/gh-workflow-issue-creator/milestones)

</div>