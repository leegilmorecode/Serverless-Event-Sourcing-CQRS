export const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['REQUEST_LEAVE', 'CANCEL_LEAVE'],
    },
    amount: {
      type: 'number',
    },
  },
  required: ['type', 'amount'],
};
