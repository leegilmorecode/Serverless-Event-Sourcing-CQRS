import {
  Event,
  cancelLeave,
  createEmployee,
  createSnapshot,
  deleteEmployee,
  eventTypes,
  getCurrentEmployeeView,
  requestLeave,
  updateEmployee,
} from './employee-aggregate';

import { CreateEmployeeCommand } from '@dto/create-employee';
import { DeleteEmployeeCommand } from '@dto/delete-employee';
import { Employee } from '@dto/employee';
import { UpdateEmployeeCommand } from '@dto/update-employee';
import { UpdateLeaveCommand } from '@dto/update-leave';

describe('employee-aggregate', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-04-01'));
  });

  describe('getCurrentEmployeeView', () => {
    it('should calculate the correct leave amount', () => {
      const requests: Event[] = [
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 1,
          datetime: '2024-01-01T13:35:58Z',
          type: eventTypes.EMPLOYEE_CREATED,
          firstName: 'Lee',
          surname: 'Gilmore',
          amount: 20,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 2,
          datetime: '2024-01-02T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 10,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 3,
          datetime: '2024-01-03T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 5,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 4,
          datetime: '2024-01-03T13:35:58Z',
          type: eventTypes.SNAPSHOT,
          amount: 15,
          firstName: 'Lee',
          surname: 'Gilmore',
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 5,
          datetime: '2024-01-04T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 1,
        },
      ];

      expect(
        getCurrentEmployeeView(requests, 'f1e6930f-3294-43e8-8fab-1ed8736bab9a')
      ).toMatchInlineSnapshot(`
{
  "amount": 14,
  "firstName": "Lee",
  "id": "f1e6930f-3294-43e8-8fab-1ed8736bab9a",
  "lastUpdated": "2024-01-04T13:35:58Z",
  "surname": "Gilmore",
  "version": 5,
}
`);
    });

    it('should calculate the correct leave amount with no snapshot', () => {
      const requests: Event[] = [
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 1,
          datetime: '2024-01-01T13:35:58Z',
          type: eventTypes.EMPLOYEE_CREATED,
          firstName: 'Lee',
          surname: 'Gilmore',
          amount: 20,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 2,
          datetime: '2024-01-02T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 10,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 3,
          datetime: '2024-01-03T13:35:58Z',
          type: eventTypes.LEAVE_CANCELLED,
          amount: 5,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 4,
          datetime: '2024-01-04T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 1,
        },
      ];

      expect(
        getCurrentEmployeeView(requests, 'f1e6930f-3294-43e8-8fab-1ed8736bab9a')
      ).toMatchInlineSnapshot(`
{
  "amount": 19,
  "firstName": "Lee",
  "id": "f1e6930f-3294-43e8-8fab-1ed8736bab9a",
  "lastUpdated": "2024-01-04T13:35:58Z",
  "surname": "Gilmore",
  "version": 4,
}
`);
    });

    it('should calculate the correct leave amount with multiple snapshots', () => {
      const requests: Event[] = [
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
          datetime: '2024-01-02T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 10,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 3,
          datetime: '2024-01-03T13:35:58Z',
          type: eventTypes.LEAVE_CANCELLED,
          amount: 5,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 4,
          datetime: '2024-01-03T13:35:58Z',
          type: eventTypes.SNAPSHOT,
          amount: 15,
          firstName: 'Lee',
          surname: 'Gilmore',
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 5,
          datetime: '2024-01-04T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 1,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 6,
          datetime: '2024-01-05T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 1,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 7,
          datetime: '2024-01-06T13:35:58Z',
          type: eventTypes.SNAPSHOT,
          amount: 13,
          firstName: 'Lee',
          surname: 'Gilmore',
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 8,
          datetime: '2024-01-07T13:35:58Z',
          type: eventTypes.LEAVE_CANCELLED,
          amount: 3,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 9,
          datetime: '2024-01-08T13:35:58Z',
          type: eventTypes.LEAVE_CANCELLED,
          amount: 2,
        },
      ];

      expect(
        getCurrentEmployeeView(requests, 'f1e6930f-3294-43e8-8fab-1ed8736bab9a')
      ).toMatchInlineSnapshot(`
{
  "amount": 18,
  "firstName": "Lee",
  "id": "f1e6930f-3294-43e8-8fab-1ed8736bab9a",
  "lastUpdated": "2024-01-08T13:35:58Z",
  "surname": "Gilmore",
  "version": 9,
}
`);
    });

    it('should default the leave to 25 days if no inital record and no snapshots', () => {
      const requests: Event[] = [
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 1,
          datetime: '2024-01-02T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 10,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 2,
          datetime: '2024-01-03T13:35:58Z',
          type: eventTypes.LEAVE_CANCELLED,
          amount: 5,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 3,
          datetime: '2024-01-04T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 1,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 4,
          datetime: '2024-01-05T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 1,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 6,
          datetime: '2024-01-07T13:35:58Z',
          type: eventTypes.LEAVE_CANCELLED,
          amount: 3,
        },
      ];

      expect(
        getCurrentEmployeeView(requests, 'f1e6930f-3294-43e8-8fab-1ed8736bab9a')
      ).toMatchInlineSnapshot(`
{
  "amount": 21,
  "firstName": "",
  "id": "f1e6930f-3294-43e8-8fab-1ed8736bab9a",
  "lastUpdated": "2024-01-07T13:35:58Z",
  "surname": "",
  "version": 6,
}
`);
    });

    it('should calculate the correct employee with multiple snapshots', () => {
      const requests: Event[] = [
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
      ];

      expect(
        getCurrentEmployeeView(requests, 'f1e6930f-3294-43e8-8fab-1ed8736bab9a')
      ).toMatchInlineSnapshot(`
{
  "amount": 20,
  "firstName": "Lee James",
  "id": "f1e6930f-3294-43e8-8fab-1ed8736bab9a",
  "lastUpdated": "2024-01-08T13:35:58Z",
  "surname": "Gilmore-Jones",
  "version": 6,
}
`);
    });

    it('should calculate the correct employee with no snapshots', () => {
      const requests: Event[] = [
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 1,
          datetime: '2024-01-01T13:35:58Z',
          type: eventTypes.EMPLOYEE_CREATED,
          amount: 15,
          firstName: 'Lee',
          surname: 'Gilmore',
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 2,
          datetime: '2024-01-02T13:35:58Z',
          type: eventTypes.EMPLOYEE_UPDATED,
          firstName: 'Lee',
          surname: 'Gilmore-Jones',
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 3,
          datetime: '2024-01-04T13:35:58Z',
          type: eventTypes.EMPLOYEE_UPDATED,
          firstName: 'Lee James',
          surname: 'Gilmore-Jones',
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 4,
          datetime: '2024-01-08T13:35:58Z',
          type: eventTypes.EMPLOYEE_UPDATED,
          firstName: 'Lee-James',
          surname: 'Gilmore-Jones',
        },
      ];

      expect(
        getCurrentEmployeeView(requests, 'f1e6930f-3294-43e8-8fab-1ed8736bab9a')
      ).toMatchInlineSnapshot(`
{
  "amount": 25,
  "firstName": "Lee-James",
  "id": "f1e6930f-3294-43e8-8fab-1ed8736bab9a",
  "lastUpdated": "2024-01-08T13:35:58Z",
  "surname": "Gilmore-Jones",
  "version": 4,
}
`);
    });

    it('should calculate the correct employee when employee deleted', () => {
      const requests: Event[] = [
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
          type: eventTypes.EMPLOYEE_DELETED,
          amount: 0,
        },
      ];

      expect(
        getCurrentEmployeeView(requests, 'f1e6930f-3294-43e8-8fab-1ed8736bab9a')
      ).toMatchInlineSnapshot(`
{
  "amount": 0,
  "firstName": "Lee James",
  "id": "f1e6930f-3294-43e8-8fab-1ed8736bab9a",
  "lastUpdated": "2024-01-09T13:35:58Z",
  "surname": "Gilmore-Jones",
  "version": 7,
}
`);
    });

    it('should calculate the correct employee with multiple leave requests', () => {
      const requests: Event[] = [
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
          datetime: '2024-01-04T13:35:58Z',
          type: eventTypes.EMPLOYEE_UPDATED,
          firstName: 'Lee',
          surname: 'Gilmore-Jones',
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 3,
          datetime: '2024-01-04T13:35:58Z',
          type: eventTypes.SNAPSHOT,
          amount: 20,
          firstName: 'Lee',
          surname: 'Gilmore-Jones',
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 4,
          datetime: '2024-01-04T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 1,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 5,
          datetime: '2024-01-04T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 1,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 6,
          datetime: '2024-01-05T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 1,
        },
      ];

      expect(
        getCurrentEmployeeView(requests, 'f1e6930f-3294-43e8-8fab-1ed8736bab9a')
      ).toMatchInlineSnapshot(`
{
  "amount": 17,
  "firstName": "Lee",
  "id": "f1e6930f-3294-43e8-8fab-1ed8736bab9a",
  "lastUpdated": "2024-01-05T13:35:58Z",
  "surname": "Gilmore-Jones",
  "version": 6,
}
`);
    });
  });

  describe('create-employee', () => {
    it('should throw an error if the leave is not 1 or more', () => {
      // arrange
      const command: CreateEmployeeCommand = {
        amount: 0,
        firstName: 'Lee',
        surname: 'Gilmore',
        type: 'CREATE_EMPLOYEE',
      };

      // act / assert
      expect(() => createEmployee(command)).toThrowErrorMatchingInlineSnapshot(
        `"Leave entitlement should be 1 or more"`
      );
    });

    it('should return the correct value on success', () => {
      // arrange
      const command: CreateEmployeeCommand = {
        amount: 25,
        firstName: 'Lee',
        surname: 'Gilmore',
        type: 'CREATE_EMPLOYEE',
      };

      // act / assert
      expect(createEmployee(command)).toMatchInlineSnapshot(`
{
  "amount": 25,
  "datetime": "2024-04-01T00:00:00.000Z",
  "firstName": "Lee",
  "id": "f39e49ad-8f88-448f-8a15-41d560ad6d70",
  "surname": "Gilmore",
  "type": "EMPLOYEE_CREATED",
  "version": 1,
}
`);
    });
  });

  describe('request-leave', () => {
    it('should throw an error if the command type is not `LEAVE_REQUESTED`', () => {
      const employee: Employee = {
        amount: 25,
        firstName: 'Lee-James',
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        lastUpdated: '2024-01-01T13:35:58Z',
        surname: 'Gilmore-Jones',
        version: 4,
      };
      const command: UpdateLeaveCommand = {
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        amount: 5,
        type: 'CANCEL_LEAVE', // wrong type
      };

      expect(() =>
        requestLeave(employee, command)
      ).toThrowErrorMatchingInlineSnapshot(`"Invalid operation"`);
    });

    it('should throw an error if the employee has no leave to take', () => {
      const employee: Employee = {
        amount: 0, // no leave to take
        firstName: 'Lee-James',
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        lastUpdated: '2024-01-01T13:35:58Z',
        surname: 'Gilmore-Jones',
        version: 4,
      };
      const command: UpdateLeaveCommand = {
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        amount: 5,
        type: 'REQUEST_LEAVE',
      };

      expect(() =>
        requestLeave(employee, command)
      ).toThrowErrorMatchingInlineSnapshot(`"Employee has no remaining leave"`);
    });

    it('should throw an error if the employee takes more leave than they have', () => {
      const employee: Employee = {
        amount: 5, // only 5 days remaining
        firstName: 'Lee-James',
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        lastUpdated: '2024-01-01T13:35:58Z',
        surname: 'Gilmore-Jones',
        version: 4,
      };
      const command: UpdateLeaveCommand = {
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        amount: 10, // ten days requested but we only have 5 remaining
        type: 'REQUEST_LEAVE',
      };

      expect(() =>
        requestLeave(employee, command)
      ).toThrowErrorMatchingInlineSnapshot(
        `"Employee does not have enough remaining leave for request"`
      );
    });

    it('should return the correct new event on success', () => {
      const employee: Employee = {
        amount: 10,
        firstName: 'Lee-James',
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        lastUpdated: '2024-01-01T13:35:58Z',
        surname: 'Gilmore-Jones',
        version: 4,
      };

      const command: UpdateLeaveCommand = {
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        amount: 4,
        type: 'REQUEST_LEAVE',
      };

      expect(requestLeave(employee, command)).toMatchInlineSnapshot(`
{
  "amount": 4,
  "datetime": "2024-04-01T00:00:00.000Z",
  "id": "f1e6930f-3294-43e8-8fab-1ed8736bab9a",
  "type": "LEAVE_REQUESTED",
  "version": 5,
}
`);
    });
  });

  describe('cancel-leave', () => {
    it('should throw an error if the command type is not `LEAVE_CANCELLED`', () => {
      const employee: Employee = {
        amount: 25,
        firstName: 'Lee-James',
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        lastUpdated: '2024-01-01T13:35:58Z',
        surname: 'Gilmore-Jones',
        version: 4,
      };

      const command: UpdateLeaveCommand = {
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        amount: 5,
        type: 'REQUEST_LEAVE', // wrong type
      };

      expect(() =>
        cancelLeave(employee, command)
      ).toThrowErrorMatchingInlineSnapshot(`"Invalid operation"`);
    });

    it('should throw an error if the leave request is 0', () => {
      const employee: Employee = {
        amount: 10,
        firstName: 'Lee-James',
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        lastUpdated: '2024-01-01T13:35:58Z',
        surname: 'Gilmore-Jones',
        version: 4,
      };

      const command: UpdateLeaveCommand = {
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        amount: 0,
        type: 'CANCEL_LEAVE',
      };

      expect(() =>
        cancelLeave(employee, command)
      ).toThrowErrorMatchingInlineSnapshot(
        `"leave amount to cancel must be over 0"`
      );
    });

    it('should throw an error if the employee has full allocation', () => {
      const employee: Employee = {
        amount: 25, // has full allocation
        firstName: 'Lee-James',
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        lastUpdated: '2024-01-01T13:35:58Z',
        surname: 'Gilmore-Jones',
        version: 4,
      };

      const command: UpdateLeaveCommand = {
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        amount: 10, // ten days cancelled but we have no leave to cancel
        type: 'CANCEL_LEAVE',
      };

      expect(() =>
        cancelLeave(employee, command)
      ).toThrowErrorMatchingInlineSnapshot(`"Employee has no leave to cancel"`);
    });

    it('should return the correct new event on success', () => {
      const employee: Employee = {
        amount: 10,
        firstName: 'Lee-James',
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        lastUpdated: '2024-01-01T13:35:58Z',
        surname: 'Gilmore-Jones',
        version: 3,
      };

      const command: UpdateLeaveCommand = {
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        amount: 6,
        type: 'CANCEL_LEAVE',
      };

      expect(cancelLeave(employee, command)).toMatchInlineSnapshot(`
{
  "amount": 6,
  "datetime": "2024-04-01T00:00:00.000Z",
  "id": "f1e6930f-3294-43e8-8fab-1ed8736bab9a",
  "type": "LEAVE_CANCELLED",
  "version": 4,
}
`);
    });
  });

  describe('update-employee', () => {
    it('should throw an error if the command type is not `UPDATE_EMPLOYEE`', () => {
      const employee: Employee = {
        amount: 25,
        firstName: 'Lee-James',
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        lastUpdated: '2024-01-01T13:35:58Z',
        surname: 'Gilmore-Jones',
        version: 4,
      };

      const command: UpdateEmployeeCommand = {
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        firstName: 'Lee James',
        surname: 'Gilmore',
        type: 'UPDATE_LEAVE',
      } as any;

      expect(() =>
        updateEmployee(employee, command)
      ).toThrowErrorMatchingInlineSnapshot(`"Invalid operation"`);
    });

    it('should throw an error if the firstName is blank', () => {
      const employee: Employee = {
        amount: 25,
        firstName: 'Lee-James',
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        lastUpdated: '2024-01-01T13:35:58Z',
        surname: 'Gilmore-Jones',
        version: 4,
      };

      const command: UpdateEmployeeCommand = {
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        firstName: '', // blank first name
        surname: 'Gilmore',
        type: 'UPDATE_EMPLOYEE',
      };

      expect(() =>
        updateEmployee(employee, command)
      ).toThrowErrorMatchingInlineSnapshot(`"Incorrect name"`);
    });

    it('should throw an error if the firstName is blank', () => {
      const employee: Employee = {
        amount: 25,
        firstName: 'Lee-James',
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        lastUpdated: '2024-01-01T13:35:58Z',
        surname: 'Gilmore-Jones',
        version: 4,
      };

      const command: UpdateEmployeeCommand = {
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        firstName: 'Lee',
        surname: '', // blank surname
        type: 'UPDATE_EMPLOYEE',
      };

      expect(() =>
        updateEmployee(employee, command)
      ).toThrowErrorMatchingInlineSnapshot(`"Incorrect name"`);
    });

    it('should return the correct new event on success', () => {
      const employee: Employee = {
        amount: 10,
        firstName: 'Lee-James',
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        lastUpdated: '2024-01-01T13:35:58Z',
        surname: 'Gilmore-Jones',
        version: 3,
      };

      const command: UpdateEmployeeCommand = {
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        firstName: 'Lee James Tom',
        surname: 'Gilmore Senior',
        type: 'UPDATE_EMPLOYEE',
      };

      expect(updateEmployee(employee, command)).toMatchInlineSnapshot(`
{
  "datetime": "2024-04-01T00:00:00.000Z",
  "firstName": "Lee James Tom",
  "id": "f1e6930f-3294-43e8-8fab-1ed8736bab9a",
  "surname": "Gilmore Senior",
  "type": "EMPLOYEE_UPDATED",
  "version": 4,
}
`);
    });
  });

  describe('delete-employee', () => {
    it('should return the correct new event on success', () => {
      const employee: Employee = {
        amount: 10,
        firstName: 'Lee-James',
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        lastUpdated: '2024-01-01T13:35:58Z',
        surname: 'Gilmore-Jones',
        version: 3,
      };

      const command: DeleteEmployeeCommand = {
        id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
        type: 'DELETE_EMPLOYEE',
      };

      expect(deleteEmployee(employee, command)).toMatchInlineSnapshot(`
{
  "amount": 0,
  "datetime": "2024-04-01T00:00:00.000Z",
  "id": "f1e6930f-3294-43e8-8fab-1ed8736bab9a",
  "type": "EMPLOYEE_DELETED",
  "version": 4,
}
`);
    });
  });

  describe('create-snapshot', () => {
    it('should return true if there are no events', () => {
      expect(createSnapshot([])).toEqual(true);
    });

    it('should return true if there are no snapshots in the past ten events', () => {
      const requests: Event[] = [
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 1,
          datetime: '2024-01-01T13:35:58Z',
          type: eventTypes.EMPLOYEE_CREATED,
          firstName: 'Lee',
          surname: 'Gilmore',
          amount: 20,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 2,
          datetime: '2024-01-02T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 10,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 3,
          datetime: '2024-01-03T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 5,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 4,
          datetime: '2024-01-04T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 1,
        },
      ];
      expect(createSnapshot(requests)).toEqual(true);
    });

    it('should return false if there is at least one snapshot in the past nine events', () => {
      const requests: Event[] = [
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 1,
          datetime: '2024-01-01T13:35:58Z',
          type: eventTypes.EMPLOYEE_CREATED,
          firstName: 'Lee',
          surname: 'Gilmore',
          amount: 20,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 2,
          datetime: '2024-01-02T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 1,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 3,
          datetime: '2024-01-03T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 1,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 4,
          datetime: '2024-01-03T13:35:58Z',
          type: eventTypes.SNAPSHOT,
          amount: 15,
          firstName: 'Lee',
          surname: 'Gilmore',
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 5,
          datetime: '2024-01-04T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 1,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 6,
          datetime: '2024-01-04T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 1,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 6,
          datetime: '2024-01-04T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 1,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 6,
          datetime: '2024-01-04T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 1,
        },
        {
          id: 'f1e6930f-3294-43e8-8fab-1ed8736bab9a',
          version: 6,
          datetime: '2024-01-04T13:35:58Z',
          type: eventTypes.LEAVE_REQUESTED,
          amount: 1,
        },
      ];
      expect(createSnapshot(requests)).toEqual(false);
    });
  });
});
