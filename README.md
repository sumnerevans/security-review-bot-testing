# Security Review Bot

Automated security review approval system using GitHub Actions and the github-actions bot user.

## Overview

This bot manages security review approvals by posting standardized approval comments on PRs. The presence of an approval comment from the github-actions bot indicates that a PR (and thus the build) has been security reviewed and can be sent to the plugin artifacts app.

## Approval Comment Format

```
Security Review Passed

Reviewer: @username

Reason: @username who is in the security reviewers group as of [timestamp] approved the PR before merge.
```

## Usage

### Post-Merge Security Reviews

Security reviewers can manually approve a PR after it has been merged by commenting either:

```
security review passed
```

or

```
security review complete
```

The phrases are case-insensitive. The bot will validate that the commenter is in the security reviewers group and post the official approval comment.

### Pre-Merge Security Reviews (Automatic)

If a security reviewer approves the latest commit on a PR before it's merged, the bot will automatically post the approval comment when the PR is merged.

## Configuration

### Security Reviewers Team

Authorized security reviewers are managed through a GitHub organization team. Configure the team in `.github/security-review-config.json`:

```json
{
  "organization": "your-org-name",
  "team_slug": "security-reviewers",
  "description": "Configuration for security review team. The team_slug is the URL-friendly version of the team name."
}
```

To add or remove security reviewers, add or remove them from the GitHub team in your organization. The bot will fetch the current team membership dynamically on each run.

**Required Permissions**: The `GITHUB_TOKEN` must have permission to read organization team membership. This is automatically granted when the workflow runs in a repository owned by the organization.

## Workflows

### Post-Merge Security Review Workflow

- **File**: `.github/workflows/post-merge-security-review.yml`
- **Trigger**: Issue comment containing "security review passed" or "security review complete" (case-insensitive)
- **Permissions**: Validates commenter is a security reviewer before posting approval

### Pre-Merge Security Review Workflow

- **File**: `.github/workflows/pre-merge-security-review.yml`
- **Trigger**: PR merge (closed with merged status)
- **Behavior**: Automatically posts approval if a security reviewer approved the latest commit

## Integration with Plugin Artifacts App

The plugin artifacts app should look for the security review approval comment from the github-actions bot to determine if a build has been security reviewed.

Example check:
1. Query PR comments for comments from `github-actions[bot]`
2. Look for comments matching the pattern "Security Review Passed"
3. Extract reviewer information and timestamp for audit trail

## Development

### Setup

```bash
npm install
```

### Files Structure

```
.github/
├── scripts/
│   └── security-review.js           # Core logic for security review validation
├── workflows/
│   ├── post-merge-security-review.yml   # Manual post-merge approval workflow
│   └── pre-merge-security-review.yml    # Automatic pre-merge approval workflow
└── security-review-config.json      # Organization and team configuration
```

## Permissions Required

The GitHub Actions workflows require the following permissions:
- `contents: read` - Read repository contents
- `pull-requests: write` - Post comments on PRs
- `issues: write` - Post comments on issues (PRs are issues)
- `organization: read` (implicit) - Read organization team membership

## Testing

To test the bot:

1. Configure your organization and team in `.github/security-review-config.json`
2. Add test users to the GitHub team in your organization
3. Create a test PR
4. For post-merge: Merge PR, then comment "security review passed" or "security review complete"
5. For pre-merge: Approve the PR with a security reviewer account, then merge

## Security Considerations

- Only users in the configured GitHub organization team can trigger security review approvals
- Team membership is fetched dynamically on each workflow run, ensuring up-to-date authorization
- The bot validates approvals against the latest commit SHA for pre-merge reviews
- All approvals include timestamp and reviewer information for audit trails
- Manual post-merge approvals require explicit comment trigger