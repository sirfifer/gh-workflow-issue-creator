import * as core from '@actions/core';
import * as github from '@actions/github';
import { getConfig } from './lib/config';
import { buildContext } from './lib/context';
import { autoDetectCategory } from './lib/category';
import { computeFingerprint } from './lib/fingerprint';
import { renderBody } from './lib/render';
import { IssueManager } from './lib/issue-manager';
import { redactText } from './lib/redact';

async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token', { required: true });
    const octokit = github.getOctokit(token);

    const inputs = getConfig();
    const ghCtx = buildContext(inputs);

    // Category
    let category = inputs.category;
    if (inputs.autoDetectCategory) {
      category = autoDetectCategory({
        workflow: ghCtx.workflow.name,
        jobName: ghCtx.workflow.job,
        additionalLabels: inputs.additionalLabels
      });
    }
    core.setOutput('detected-category', category);

    if (inputs.mode === 'close-on-success') {
      const manager = new IssueManager(octokit, inputs, ghCtx);
      const fp = computeFingerprint({ ctx: ghCtx, category, errorSignatures: [] });
      const closed = await manager.closeIfOpenByFingerprint(fp);
      core.setOutput('fingerprint', fp);
      core.setOutput('resolved', String(closed));
      return;
    }

    // Snooze
    if (inputs.snoozeUntil) {
      const nowISO = new Date().toISOString();
      if (nowISO < inputs.snoozeUntil) {
        core.info(`Snoozed until ${inputs.snoozeUntil}; skipping issue creation.`);
        return;
      }
    }

    // Compute fingerprint early
    const fingerprint = computeFingerprint({ ctx: ghCtx, category, errorSignatures: ghCtx.errorSignatures || [] });
    core.setOutput('fingerprint', fingerprint);

    const manager = new IssueManager(octokit, inputs, ghCtx);
    const existing = await manager.findExistingByFingerprint(fingerprint);

    const template = await manager.loadTemplate(category);
    const bodyUnredacted = await renderBody({
      template,
      inputs,
      ctx: ghCtx,
      category,
      fingerprint,
    });

    const body = redactText(bodyUnredacted);
    const title = `[${ghCtx.workflow.name}] failed — ${category} — ${fingerprint}`;

    const result = await manager.createOrUpdate({ existing, title, body, fingerprint, category });

    core.setOutput('issue-number', result.number);
    core.setOutput('issue-url', result.html_url);
    core.setOutput('deduped', String(Boolean(existing)));
  } catch (err: any) {
    core.setFailed(err?.message ?? String(err));
  }
}

run();
