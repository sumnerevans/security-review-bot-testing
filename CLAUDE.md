# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a GitHub Actions-based security review approval system. The bot uses the `github-actions` bot user to post standardized approval comments on PRs to indicate that a PR (and its build) has been security reviewed and approved for the plugin artifacts app.

## Architecture

### Two Approval Workflows

1. **Post-Merge Security Review** (`.github/workflows/post-merge-security-review.yml`)
   - Triggered by: Issue comments containing `@github-actions security review passed`
   - Validates that the commenter is in the authorized security reviewers list
   - Posts approval comment if validation passes

2. **Pre-Merge Security Review** (`.github/workflows/pre-merge-security-review.yml`)
   - Triggered by: PR merge (pull_request closed with merged=true)
   - Checks if a security reviewer approved the latest commit before merge
   - Automatically posts approval comment if approval found

### Core Logic

The shared approval logic lives in `.github/scripts/security-review.js`:
- Loads authorized reviewers from `.github/security-reviewers.json`
- Supports two modes: `post-merge` (validates commenter) and `pre-merge` (checks PR reviews)
- Pre-merge mode specifically validates approvals against the latest commit SHA to prevent stale approvals
- Posts standardized approval comments with reviewer and timestamp

### Approval Comment Format

```
Security Review Passed

Reviewer: @username

Reason: @username who is in the security reviewers group as of [timestamp] approved the PR before merge.
```

This comment format is consumed by the plugin artifacts app to determine if a build has been security reviewed.

## Configuration

### Adding/Removing Security Reviewers

Edit `.github/security-reviewers.json` and add/remove GitHub usernames from the `reviewers` array. Changes take effect immediately on the next workflow run.

## Workflow Execution Details

Both workflows:
- Use `actions/github-script@v7` to execute the security review script inline
- Install dependencies dynamically (`@actions/core`, `@actions/github`)
- Use `eval()` to execute `.github/scripts/security-review.js` with environment variables as inputs
- Require `pull-requests: write` and `issues: write` permissions to post comments

## Testing

To test the workflows:
1. Add test users to `.github/security-reviewers.json`
2. Create and merge a test PR
3. For post-merge: Comment `@github-actions security review passed` as an authorized reviewer
4. For pre-merge: Have an authorized reviewer approve the PR on the latest commit, then merge
