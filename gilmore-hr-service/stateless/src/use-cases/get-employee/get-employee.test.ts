import * as getEvents from '@repositories/employee-repository/employee-repository';

import { Events, eventTypes } from '@aggregates/employee-aggregate';

import { getEmployeeUseCase } from './get-employee';

describe('get-employee', () => {
  const eventHistory: Events = [
    {
      id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
      version: 1,
      datetime: '2024-01-01T13:35:58Z',
      type: eventTypes.EMPLOYEE_CREATED,
      amount: 20,
      firstName: 'Lee',
      surname: 'Gilmore',
    },
    {
      id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
      version: 2,
      datetime: '2024-01-03T13:35:58Z',
      type: eventTypes.SNAPSHOT,
      amount: 20,
      firstName: 'Lee',
      surname: 'Gilmore',
    },
    {
      id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
      version: 3,
      datetime: '2024-01-04T13:35:58Z',
      type: eventTypes.EMPLOYEE_UPDATED,
      firstName: 'Lee',
      surname: 'Gilmore-Jones',
    },
    {
      id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
      version: 4,
      datetime: '2024-01-06T13:35:58Z',
      type: eventTypes.SNAPSHOT,
      firstName: 'Lee',
      surname: 'Gilmore-Jones',
      amount: 20,
    },
    {
      id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
      version: 5,
      datetime: '2024-01-07T13:35:58Z',
      type: eventTypes.EMPLOYEE_UPDATED,
      firstName: 'Lee',
      surname: 'Gilmore-Jones',
    },
    {
      id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
      version: 6,
      datetime: '2024-01-08T13:35:58Z',
      type: eventTypes.EMPLOYEE_UPDATED,
      firstName: 'Lee James',
      surname: 'Gilmore-Jones',
    },
    {
      id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
      version: 7,
      datetime: '2024-01-09T13:35:58Z',
      type: eventTypes.LEAVE_REQUESTED,
      amount: 2,
    },
  ];

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-04-01'));
  });

  beforeEach(() => {
    jest.spyOn(getEvents, 'getEvents').mockResolvedValue(eventHistory);
  });

  it('should return the correct employee value', async () => {
    // act / assert
    expect(
  await getEmployeeUseCase('f1e6930f-3294-43e8-8fab-1ed8736bab9a')
).toMatchInlineSnapshot(`
{
  "amount": 18,
  "firstName": "Lee James",
  "id": "f1e6930f-3294-43e8-8fab-1ed8736bab9a",
  "lastUpdated": "2024-01-09T13:35:58Z",
  "surname": "Gilmore-Jones",
  "version": 7,
}
`);
  });
});
