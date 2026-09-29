import { canLeaveConversation, isLastMessage, isWebhookConversation } from './utils-message';

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

  it("hides the buttons after the agent's own action click", () => {
    const actionClick = { uid: '2', attributes: { subtype: 'info', action: 'approve' } };
    expect(isLastMessage([text('1'), actionClick], '1')).toBe(false);
    expect(isLastMessage([text('1'), actionClick], '2')).toBe(true);
  });

  it('hides the buttons once the conversation is closed, even after a reopen', () => {
    const closed = { uid: '2', attributes: { subtype: 'info/support', messagelabel: { key: 'CHAT_CLOSED' } } };
    const reopened = { uid: '3', attributes: { subtype: 'info/support', messagelabel: { key: 'CHAT_REOPENED' } } };
    expect(isLastMessage([text('1'), closed], '1')).toBe(false);
    expect(isLastMessage([text('1'), closed, reopened], '1')).toBe(false);
  });

  it('keeps the buttons after a member joined line', () => {
    const joined = { uid: '2', attributes: { subtype: 'info/support', messagelabel: { key: 'MEMBER_JOINED_GROUP' } } };
    expect(isLastMessage([text('1'), joined], '1')).toBe(true);
  });

  it('skips missing entries', () => {
    expect(isLastMessage([text('1'), null, undefined], '1')).toBe(true);
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

describe('utils-message canLeaveConversation', () => {

  it('returns true for an open webhook conversation', () => {
    expect(canLeaveConversation({ attributes: { request_channel: 'webhook' }, archived: false })).toBe(true);
  });

  it('returns false for an archived webhook conversation', () => {
    expect(canLeaveConversation({ attributes: { request_channel: 'webhook' }, archived: true })).toBe(false);
  });

  it('returns false for a non-webhook conversation', () => {
    expect(canLeaveConversation({ attributes: { request_channel: 'chat21' }, archived: false })).toBe(false);
  });

  it('returns false for a missing conversation', () => {
    expect(canLeaveConversation(null)).toBe(false);
  });
});
