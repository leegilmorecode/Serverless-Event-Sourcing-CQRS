export const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    type: {
      type: 'string',
      enum: ['LEAVE_REQUESTED', 'LEAVE_CANCELLED'],
    },
    amount: {
      type: 'number',
    },
  },
  required: ['id', 'type', 'amount'],
};
