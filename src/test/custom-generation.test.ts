import { describe, expect, it } from 'vitest';
import { availableStages, compileCustomPrompt, customGenerationPack, isAccepted } from '../lib/ai/custom-generation';
import type { PromptId } from '../lib/ai/custom-generation';
import { createVideoGateway } from '../lib/ai/custom-generation/video-gateway.server';

describe('custom generation handoff', () => {
  it('unconfigured video gateway blocks without fabricating a provider job or URL', async () => {
    const result = await createVideoGateway().reconcile('synthetic-owner', 'synthetic-request');
    expect(result.status).toBe('blocked');
    expect(result).not.toHaveProperty('providerJobId');
    expect(result).not.toHaveProperty('temporaryOutputUrl');
  });
  it('every pipeline prompt resolves and every template expands with its declared inputs', () => {
    for (const [id, template] of Object.entries(customGenerationPack.prompts)) {
      const vars = Object.fromEntries(template.inputs.map(key => [key, `fixture-${key}`]));
      expect(compileCustomPrompt(id as PromptId, vars).prompt).not.toMatch(/\{\{[A-Z_]+\}\}/);
    }
    for (const stages of Object.values(customGenerationPack.pipelines)) {
      const seen = new Set<string>();
      for (const stage of stages) {
        expect(stage.after.every(id => seen.has(id))).toBe(true);
        if (stage.kind === 'prompt' || stage.kind === 'image') {
          expect(customGenerationPack.prompts).toHaveProperty(stage.uses!);
        }
        seen.add(stage.id);
      }
    }
  });
  it('rejects missing image input and retains transparency and actual attachment roles', () => {
    expect(() => compileCustomPrompt('art.house', {})).toThrow('HOUSE_EN');
    const result = compileCustomPrompt('art.house', { HOUSE_EN: 'A small moss-green house' });
    expect(result.transparent).toBe(true);
    expect(result.references.length).toBeGreaterThan(0);
  });
  it('expands shared vocabulary rules but never recursively interprets supplied data', () => {
    const template = customGenerationPack.prompts['webcomic.script.v1'];
    const vars = Object.fromEntries(template.inputs.filter(k => k !== 'WORDS_AND_RULES').map(k => [k, 'fixture']));
    const result = compileCustomPrompt('webcomic.script.v1', {...vars, ALLOWED:'我 | wo3 | I', NAMES:'none'});
    expect(result.prompt).toContain('我 | wo3 | I');
    expect(result.prompt).not.toContain('{{WORDS_AND_RULES}}');
    expect(compileCustomPrompt('art.house', {HOUSE_EN:'Literal {{PRIVATE_DATA}}'}).prompt).toContain('{{PRIVATE_DATA}}');
  });
  it('never accepts stale reviews, deterministic failures or uncertain evidence', () => {
    const e = {candidateHash:'new',checkedHash:'new',reviewedHash:'new',deterministicPassed:true,verdict:'accept' as const,blockingIssues:[]};
    expect(isAccepted(e)).toBe(true);
    expect(isAccepted({...e, reviewedHash:'old'})).toBe(false);
    expect(isAccepted({...e, deterministicPassed:false})).toBe(false);
    expect(isAccepted({...e, verdict:'uncertain'})).toBe(false);
    expect(isAccepted({...e, blockingIssues:['wrong sense']})).toBe(false);
  });
  it('does not release comic image generation before script review', () => {
    expect(availableStages('webcomic', ['vocabulary','scenarios','plan','script']).map(s => s.id)).toEqual(['review']);
    expect(availableStages('webcomic', ['vocabulary','scenarios','plan','script','review']).map(s => s.id)).toEqual(['art_briefs']);
  });
});
