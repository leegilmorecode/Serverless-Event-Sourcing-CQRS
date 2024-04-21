export const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    firstName: {
      type: 'string',
    },
    surname: {
      type: 'string',
    },
  },
  required: ['id', 'firstName', 'surname'],
};
