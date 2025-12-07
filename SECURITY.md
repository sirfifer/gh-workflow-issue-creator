# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow responsible disclosure:

### How to Report

1. **Do NOT open a public issue** for security vulnerabilities
2. **GitHub Security Advisories**: Use [GitHub's private vulnerability reporting](https://github.com/your-org/gh-workflow-issue-creator/security/advisories/new)
3. **Email**: Send details to the repository maintainers via GitHub

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 7 days
  - Medium: 30 days
  - Low: Next release

### What to Expect

1. We'll acknowledge receipt of your report
2. We'll investigate and validate the issue
3. We'll work on a fix and coordinate disclosure
4. We'll credit you (unless you prefer anonymity)

## Security Measures in This Action

### Automatic Secret Redaction

The action automatically redacts sensitive data before creating issues:

- API keys and tokens
- Passwords and secrets
- Private keys (SSH, PEM)
- Database connection strings
- AWS credentials
- Credit card numbers
- JWTs and Bearer tokens

### Token Handling

- GitHub tokens are never logged or stored
- Tokens are passed directly to official GitHub libraries
- No shell commands execute with token access

### Input Validation

- All inputs are validated using Zod schemas
- User-controlled data is sanitized before use
- Template injection is prevented through proper escaping

## Security Best Practices

When using this action:

1. **Use minimal permissions**:
   ```yaml
   permissions:
     contents: read
     actions: read
     issues: write
   ```

2. **Use `GITHUB_TOKEN`** instead of PATs when possible

3. **Review cross-repo permissions** carefully when using `target-owner`/`target-repo`

4. **Keep the action updated** to receive security fixes

## Acknowledgments

We thank all security researchers who responsibly disclose vulnerabilities.
