export const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
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
  required: ['firstName', 'surname', 'amount'],
};
