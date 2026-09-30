import { canLeaveConversation, expandCommandsMessage, isLastMessage, isWebhookConversation } from './utils-message';

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


describe('utils-message expandCommandsMessage', () => {

  const buttons = [{ uid: 'b1', type: 'action', value: 'Healthy', action: '#a1', show_echo: true }];
  const commandsMessage = (): any => ({
    uid: 'm1', message_id: 'm1', text: 'first', sender: 'bot', sender_fullname: 'Bot', recipient: 'r', recipient_fullname: 'R',
    channel_type: 'group', status: 100, timestamp: 1000, type: 'text', language: 'en',
    attributes: {
      disableInputMessage: false,
      intentName: 'ask_check',
      commands: [
        { type: 'wait', time: 500 },
        { type: 'message', message: { type: 'text', text: 'First reply', attributes: {} } },
        { type: 'wait', time: 500 },
        { type: 'message', message: { type: 'text', text: ' Is it healthy? ', attributes: { attachment: { type: 'template', buttons: buttons } } } }
      ]
    }
  });

  it('turns each message command into a message, in order, with its own text and attachment', () => {
    const out = expandCommandsMessage(commandsMessage());
    expect(out.length).toBe(2);
    expect(out[0].text).toBe('First reply');
    expect(out[0].attributes.attachment).toBeUndefined();
    expect(out[1].text).toBe('Is it healthy?');
    expect(out[1].attributes.attachment.buttons).toEqual(buttons);
    expect(out[0].timestamp).toBeLessThan(out[1].timestamp);
  });

  it('gives unique, stable uids and links the parent', () => {
    const a = expandCommandsMessage(commandsMessage());
    const b = expandCommandsMessage(commandsMessage());
    expect(a[0].uid).not.toBe(a[1].uid);
    expect(a.map(m => m.uid)).toEqual(b.map(m => m.uid));
    expect(a[1].uid).toBe('m1_3');
    expect(a[1].attributes.parentUid).toBe('m1');
  });

  it('inherits sender data and parent attributes, replacing the commands array', () => {
    const out = expandCommandsMessage(commandsMessage());
    expect(out[1].sender).toBe('bot');
    expect(out[1].recipient).toBe('r');
    expect(out[1].status).toBe(100);
    expect(out[1].attributes.intentName).toBe('ask_check');
    expect(out[1].attributes.commands).toBe(true);
  });

  it('does not mutate the original message', () => {
    const msg = commandsMessage();
    expandCommandsMessage(msg);
    expect(Array.isArray(msg.attributes.commands)).toBe(true);
    expect(msg.attributes.commands[3].message.uid).toBeUndefined();
  });

  it('leaves messages without commands unchanged', () => {
    const msg: any = { uid: 'x', text: 'hi', attributes: { a: 1 } };
    expect(expandCommandsMessage(msg)).toEqual([msg]);
    const noAttrs: any = { uid: 'y', text: 'hi' };
    expect(expandCommandsMessage(noAttrs)).toEqual([noAttrs]);
  });

  it('produces no messages for wait-only or empty commands', () => {
    const msg: any = commandsMessage();
    msg.attributes.commands = [{ type: 'wait', time: 500 }];
    expect(expandCommandsMessage(msg)).toEqual([]);
    msg.attributes.commands = [];
    expect(expandCommandsMessage(msg)).toEqual([msg]);
  });

  it('keeps the buttons only on the last expanded message via isLastMessage', () => {
    const out = expandCommandsMessage(commandsMessage());
    expect(isLastMessage(out, out[1].uid)).toBe(true);
    expect(isLastMessage(out, out[0].uid)).toBe(false);
  });
});
