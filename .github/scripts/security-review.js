const fs = require('fs');

/**
 * Load security reviewers from configuration file
 */
function loadSecurityReviewers() {
  const configPath = '.github/security-reviewers.json';
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return config.reviewers;
}

/**
 * Check if a user is an authorized security reviewer
 */
function isSecurityReviewer(username, reviewers) {
  return reviewers.includes(username);
}

/**
 * Format the approval review body with reviewer details
 */
function formatApprovalBody(reviewer, timestamp) {
  return `Security Review Passed

Reviewer: @${reviewer}

Reason: @${reviewer} who is in the security reviewers group as of ${timestamp} approved the PR before merge.`;
}

/**
 * Main function to handle security review approval
 */
async function main() {
  const github = require('@actions/github');
  const core = require('@actions/core');

  const token = core.getInput('github-token', { required: true });
  const octokit = github.getOctokit(token);

  const context = github.context;
  const { owner, repo } = context.repo;

  // Try to get PR number from context first, then from input
  let prNumber = context.payload.pull_request?.number;
  if (!prNumber) {
    const prNumberInput = core.getInput('pr-number');
    prNumber = prNumberInput ? parseInt(prNumberInput, 10) : null;
  }

  if (!prNumber) {
    core.setFailed('PR number not found');
    return;
  }

  // Load security reviewers
  const securityReviewers = loadSecurityReviewers();
  core.info(`Security reviewers: ${securityReviewers.join(', ')}`);

  // Get the reviewer from workflow input
  const reviewer = core.getInput('reviewer');
  const mode = core.getInput('mode'); // 'post-merge' or 'pre-merge'

  if (mode === 'post-merge') {
    // Post-merge: validate the comment author
    if (!isSecurityReviewer(reviewer, securityReviewers)) {
      core.setFailed(`User @${reviewer} is not an authorized security reviewer`);
      return;
    }

    const timestamp = new Date().toISOString();
    const body = formatApprovalBody(reviewer, timestamp);

    await octokit.rest.pulls.createReview({
      owner,
      repo,
      pull_number: prNumber,
      body,
      event: 'APPROVE'
    });

    core.info(`Posted security review approval for reviewer @${reviewer}`);
  } else if (mode === 'pre-merge') {
    // Pre-merge: check if a security reviewer approved the latest commit
    const { data: reviews } = await octokit.rest.pulls.listReviews({
      owner,
      repo,
      pull_number: prNumber
    });

    // Get the latest commit SHA
    const { data: pr } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber
    });
    const latestCommitSha = pr.head.sha;

    // Find approvals from security reviewers on the latest commit
    const approvals = reviews.filter(review =>
      review.state === 'APPROVED' &&
      isSecurityReviewer(review.user.login, securityReviewers) &&
      review.commit_id === latestCommitSha
    );

    if (approvals.length === 0) {
      core.info('No security reviewer approval found on the latest commit');
      return;
    }

    // Use the most recent approval
    const latestApproval = approvals[approvals.length - 1];
    const timestamp = latestApproval.submitted_at;
    const body = formatApprovalBody(latestApproval.user.login, timestamp);

    await octokit.rest.pulls.createReview({
      owner,
      repo,
      pull_number: prNumber,
      body,
      event: 'APPROVE'
    });

    core.info(`Posted automatic security review approval for @${latestApproval.user.login}`);
  } else {
    core.setFailed(`Invalid mode: ${mode}. Must be 'post-merge' or 'pre-merge'`);
  }
}

main().catch(error => {
  const core = require('@actions/core');
  core.setFailed(error.message);
});
