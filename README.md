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

### Security Reviewers

Authorized security reviewers are configured in `.github/security-reviewers.json`:

```json
{
  "reviewers": [
    "octocat",
    "hubot"
  ],
  "description": "List of GitHub usernames authorized to perform security reviews."
}
```

To add or remove security reviewers, update this file and commit the changes.

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
│   └── security-review.js       # Core logic for security review validation
├── workflows/
│   ├── post-merge-security-review.yml   # Manual post-merge approval workflow
│   └── pre-merge-security-review.yml    # Automatic pre-merge approval workflow
└── security-reviewers.json      # Authorized reviewers configuration
```

## Permissions Required

The GitHub Actions workflows require the following permissions:
- `contents: read` - Read repository contents
- `pull-requests: write` - Post comments on PRs
- `issues: write` - Post comments on issues (PRs are issues)

## Testing

To test the bot:

1. Add test users to `.github/security-reviewers.json`
2. Create a test PR
3. For post-merge: Merge PR, then comment "security review passed" or "security review complete"
4. For pre-merge: Approve the PR with a security reviewer account, then merge

## Security Considerations

- Only users listed in `security-reviewers.json` can trigger security review approvals
- The bot validates approvals against the latest commit SHA for pre-merge reviews
- All approvals include timestamp and reviewer information for audit trails
- Manual post-merge approvals require explicit comment trigger