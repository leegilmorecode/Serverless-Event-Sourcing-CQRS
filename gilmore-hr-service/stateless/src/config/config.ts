const convict = require('convict');

export const config = convict({
  tableName: {
    doc: 'The table name',
    format: String,
    default: '',
    env: 'TABLE_NAME',
  },
}).validate({ allowed: 'strict' });
