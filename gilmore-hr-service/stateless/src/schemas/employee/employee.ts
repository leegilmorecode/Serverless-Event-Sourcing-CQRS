export const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    lastUpdated: {
      type: 'string',
      format: 'date-time',
    },
    firstName: {
      type: 'string',
    },
    surname: {
      type: 'string',
    },
    amount: {
      type: 'number',
    },
  },
  required: ['id', 'lastUpdated', 'firstName', 'surname', 'amount'],
};
