import { isLastMessage, isWebhookConversation } from './utils-message';

describe('utils-message isLastMessage', () => {

  const text = (uid: string) => ({ uid: uid, attributes: {} });
  const info = (uid: string) => ({ uid: uid, attributes: { subtype: 'info' } });
  const infoSupport = (uid: string) => ({ uid: uid, attributes: { subtype: 'info/support' } });

  it('returns true only for the last message', () => {
    expect(isLastMessage([text('1'), text('2')], '2')).toBe(true);
    expect(isLastMessage([text('1'), text('2')], '1')).toBe(false);
  });

  it('ignores trailing info messages (e.g. "agent added to the group")', () => {
    expect(isLastMessage([text('1'), info('2'), infoSupport('3')], '1')).toBe(true);
    expect(isLastMessage([text('1'), info('2')], '2')).toBe(false);
  });

  it('handles messages without attributes', () => {
    expect(isLastMessage([{ uid: '1' }, info('2')], '1')).toBe(true);
  });

  it('returns false for empty or missing lists', () => {
    expect(isLastMessage([], '1')).toBe(false);
    expect(isLastMessage(undefined, '1')).toBe(false);
    expect(isLastMessage([info('1')], '1')).toBe(false);
  });
});

describe('utils-message isWebhookConversation', () => {

  it('is true for conversations whose request channel is webhook', () => {
    expect(isWebhookConversation({ attributes: { request_channel: 'webhook' } })).toBe(true);
  });

  it('is false for other channels and missing data', () => {
    expect(isWebhookConversation({ attributes: { request_channel: 'chat21' } })).toBe(false);
    expect(isWebhookConversation({ attributes: {} })).toBe(false);
    expect(isWebhookConversation({})).toBe(false);
    expect(isWebhookConversation(null)).toBe(false);
  });
});
