import pack from './pack.v1.json';

export const customGenerationPack = pack;
export type PipelineName = keyof typeof pack.pipelines;
export type PromptId = keyof typeof pack.prompts;

/** No provider call or logging here: private expanded prompts stay server-side. */
export function compileCustomPrompt(id: PromptId, vars: Record<string, string>) {
  const template = pack.prompts[id];
  if (!template) throw new Error(`Unknown custom prompt: ${id}`);
  const values = { ...vars };
  if ((template.inputs as readonly string[]).includes('WORDS_AND_RULES') && !values.WORDS_AND_RULES) {
    values.WORDS_AND_RULES = expand(pack.prompts.WORDS_AND_RULES.prompt, values);
  }
  const expanded = expand(template.prompt, values);
  return {
    promptId: id,
    version: template.version,
    prompt: `${pack.common}\n\n${expanded}`,
    // The caller must resolve these library-relative paths and attach the files.
    references: 'references' in template ? template.references : [],
    transparent: 'transparent' in template ? template.transparent : null,
    validation: 'validation' in template ? template.validation : [],
    provenance: template.provenance,
  };
}

function expand(template: string, vars: Record<string, string>): string {
  const missing = [...new Set([...template.matchAll(/\{\{([A-Z_]+)\}\}/g)]
    .map(m => m[1]).filter(key => !vars[key]?.trim()))];
  if (missing.length) throw new Error(`Missing prompt inputs: ${missing.join(', ')}`);
  // One replacement pass: never interpret interpolated learner data as a template.
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key: string) => vars[key]);
}

export interface AcceptanceEvidence {
  candidateHash: string;
  checkedHash: string;
  deterministicPassed: boolean;
  reviewedHash: string;
  verdict: 'accept' | 'revise' | 'uncertain';
  blockingIssues: string[];
}

/** Bind checks/review to the same candidate; a repaired candidate needs new checks. */
export function isAccepted(evidence: AcceptanceEvidence): boolean {
  return !!evidence.candidateHash && evidence.checkedHash === evidence.candidateHash
    && evidence.reviewedHash === evidence.candidateHash
    && evidence.deterministicPassed && evidence.verdict === 'accept'
    && evidence.blockingIssues.length === 0;
}

/** Prompt dependency readiness is not publication or vocabulary eligibility. */
export function availableStages(name: PipelineName, acceptedIds: readonly string[]) {
  const accepted = new Set(acceptedIds);
  return pack.pipelines[name].filter(stage => !accepted.has(stage.id)
    && stage.after.every(id => accepted.has(id)));
}
