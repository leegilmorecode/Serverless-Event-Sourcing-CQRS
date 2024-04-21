import * as save from '@repositories/employee-repository/employee-repository';

import { CreateEmployeeCommand } from '@dto/create-employee';
import { createEmployeeUseCase } from './create-employee';

describe('create-employee', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-04-01'));
  });

  beforeEach(() => {
    jest.spyOn(save, 'save').mockResolvedValue();
  });

  it('should return the correct value on success', async () => {
    // arrange
    const command: CreateEmployeeCommand = {
      type: 'CREATE_EMPLOYEE',
      amount: 20,
      firstName: 'Lee',
      surname: 'Gilmore',
    };

    // act / assert
    expect(await createEmployeeUseCase(command)).toMatchInlineSnapshot(`
{
  "amount": 25,
  "firstName": "Lee",
  "id": "f39e49ad-8f88-448f-8a15-41d560ad6d70",
  "lastUpdated": "2024-04-01T00:00:00.000Z",
  "surname": "Gilmore",
  "version": 1,
}
`);
  });

  it('should throw an error on invariant failure', async () => {
    // arrange
    const command: CreateEmployeeCommand = {
      type: 'CREATE_EMPLOYEE',
      amount: 0, // should be 1 or more
      firstName: 'Lee',
      surname: 'Gilmore',
    };

    // act / assert
    await expect(
      createEmployeeUseCase(command)
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Leave entitlement should be 1 or more"`
    );
  });
});
