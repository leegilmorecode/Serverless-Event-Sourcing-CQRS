import { Employee, EmployeeDetails } from '@dto/employee';

import { CreateEmployeeCommand } from '@dto/create-employee';
import { DeleteEmployeeCommand } from '@dto/delete-employee';
import { UpdateEmployeeCommand } from '@dto/update-employee';
import { UpdateLeaveCommand } from '@dto/update-leave';
import { ValidationError } from '@errors/validation-error';
import { getISOString, logger } from '@shared';
import { v4 as uuid } from 'uuid';

export type Event =
  | {
      id: string;
      version: number;
      type: 'EMPLOYEE_CREATED';
      datetime: string;
      firstName: string;
      surname: string;
      amount: number;
    }
  | {
      id: string;
      version: number;
      type: 'EMPLOYEE_UPDATED';
      datetime: string;
      firstName: string;
      surname: string;
    }
  | {
      id: string;
      version: number;
      type: 'EMPLOYEE_DELETED';
      datetime: string;
      amount: number;
    }
  | {
      id: string;
      version: number;
      type: 'LEAVE_REQUESTED';
      datetime: string;
      amount: number;
    }
  | {
      id: string;
      version: number;
      type: 'LEAVE_CANCELLED';
      datetime: string;
      amount: number;
    }
  | {
      id: string;
      version: number;
      type: 'SNAPSHOT';
      datetime: string;
      amount: number;
      firstName: string;
      surname: string;
    };

export type Events = Event[];

export const eventTypes = {
  EMPLOYEE_CREATED: 'EMPLOYEE_CREATED' as const,
  EMPLOYEE_UPDATED: 'EMPLOYEE_UPDATED' as const,
  EMPLOYEE_DELETED: 'EMPLOYEE_DELETED' as const,
  LEAVE_REQUESTED: 'LEAVE_REQUESTED' as const,
  LEAVE_CANCELLED: 'LEAVE_CANCELLED' as const,
  SNAPSHOT: 'SNAPSHOT' as const,
};

export function requestLeave(
  employee: Employee,
  command: UpdateLeaveCommand
): Event {
  if (command.type !== 'REQUEST_LEAVE')
    throw new ValidationError('Invalid operation');

  // business logic
  if (employee.amount === 0)
    throw new ValidationError('Employee has no remaining leave');

  if (employee.amount - command.amount < 0)
    throw new ValidationError(
      'Employee does not have enough remaining leave for request'
    );

  // create new event based on the command
  return {
    type: 'LEAVE_REQUESTED',
    amount: command.amount,
    id: employee.id,
    datetime: getISOString(),
    version: employee.version + 1,
  };
}

export function createEmployee(command: CreateEmployeeCommand): Event {
  logger.info(`createEmployee: ${JSON.stringify(command)}`);

  if (command.type !== 'CREATE_EMPLOYEE')
    throw new ValidationError('Invalid operation');

  // business logic
  if (command.amount < 0 || command.amount === 0)
    throw new ValidationError('Leave entitlement should be 1 or more');

  // create new event based on the command
  return {
    type: 'EMPLOYEE_CREATED',
    id: uuid(),
    firstName: command.firstName,
    surname: command.surname,
    datetime: getISOString(),
    amount: 25,
    version: 1,
  };
}

export function updateEmployee(
  employee: Employee,
  command: UpdateEmployeeCommand
): Event {
  logger.info(`updateEmployee: ${JSON.stringify(command)}`);

  if (command.type !== 'UPDATE_EMPLOYEE')
    throw new ValidationError('Invalid operation');

  // business logic
  if (!command.firstName || !command.surname)
    throw new ValidationError('Incorrect name');

  // create new event based on the command
  return {
    id: employee.id,
    type: 'EMPLOYEE_UPDATED',
    firstName: command.firstName,
    surname: command.surname,
    datetime: getISOString(),
    version: employee.version + 1,
  };
}

export function deleteEmployee(
  employee: Employee,
  command: DeleteEmployeeCommand
): Event {
  logger.info(`deleteEmployee: ${JSON.stringify(command)}`);

  if (command.type !== 'DELETE_EMPLOYEE')
    throw new ValidationError('Invalid operation');

  // create new event based on the command
  return {
    id: employee.id,
    type: 'EMPLOYEE_DELETED',
    datetime: getISOString(),
    amount: 0,
    version: employee.version + 1,
  };
}

export function cancelLeave(
  employee: Employee,
  command: UpdateLeaveCommand
): Event {
  logger.info(
    `cancelLeave: ${JSON.stringify(command)}, employee: ${JSON.stringify(
      employee
    )}`
  );

  if (command.type !== 'CANCEL_LEAVE')
    throw new ValidationError('Invalid operation');

  // business logic
  if (command.amount === 0)
    throw new ValidationError('leave amount to cancel must be over 0');

  if (employee.amount === 25)
    throw new ValidationError('Employee has no leave to cancel');

  // create new event based on the command
  return {
    type: 'LEAVE_CANCELLED',
    amount: command.amount,
    id: employee.id,
    datetime: getISOString(),
    version: employee.version + 1,
  };
}

export function createSnapshot(events: Events): boolean {
  // if there are less than 9 events we create a snapshot
  if (events.length < 9) {
    const hasSnapshot = events.some(
      (event) => event.type === eventTypes.SNAPSHOT
    );
    return !hasSnapshot;
  }

  // Check if the first 9 events don't contain a snapshot, and if not create one
  const firstNineEvents = events.slice(0, 9);
  const hasSnapshotInFirstNine = firstNineEvents.some(
    (event) => event.type === eventTypes.SNAPSHOT
  );
  return !hasSnapshotInFirstNine;
}

function filterEvents(requests: Events): Events {
  return requests.filter(
    (item) =>
      item.type === eventTypes.EMPLOYEE_CREATED ||
      item.type === eventTypes.EMPLOYEE_UPDATED ||
      item.type === eventTypes.EMPLOYEE_DELETED ||
      item.type === eventTypes.SNAPSHOT ||
      item.type === eventTypes.LEAVE_CANCELLED ||
      item.type === eventTypes.LEAVE_REQUESTED
  );
}

function getCurrentVersion(requests: Events): number {
  return requests.slice().sort((a, b) => b.version - a.version)[0].version;
}

function getLastUpdatedDate(requests: Events): string {
  return requests.slice().sort((a, b) => b.version - a.version)[0].datetime;
}

export function getCurrentEmployeeView(
  requests: Events,
  id: string,
  currentLeaveAmount: number = 25
): Employee {
  logger.info(
    `getCurrentEmployeeView-  id: ${id}, currentLeaveAmount: ${currentLeaveAmount}`
  );
  let currentEmployee: EmployeeDetails = { firstName: '', surname: '' };

  const filteredRequests = filterEvents(requests);

  const sortedRequests = filteredRequests
    .slice()
    .sort((a, b) => b.version - a.version)
    .reverse();

  const lastSnapshot = sortedRequests.find(
    (request) => request.type === eventTypes.SNAPSHOT
  );

  // if there is a snapshot
  if (lastSnapshot && lastSnapshot.type === eventTypes.SNAPSHOT) {
    currentLeaveAmount = lastSnapshot.amount;
    currentEmployee = {
      firstName: lastSnapshot.firstName,
      surname: lastSnapshot.surname,
    };

    const lastSnapshotIndex = sortedRequests.indexOf(lastSnapshot);

    for (let i = lastSnapshotIndex + 1; i < sortedRequests.length; i++) {
      const request = sortedRequests[i];
      if (request.type === eventTypes.LEAVE_REQUESTED) {
        currentLeaveAmount -= request.amount;
      } else if (request.type === eventTypes.LEAVE_CANCELLED) {
        currentLeaveAmount += request.amount;
      } else if (
        request.type === eventTypes.EMPLOYEE_CREATED ||
        request.type === eventTypes.EMPLOYEE_UPDATED
      ) {
        currentEmployee = {
          firstName: request.firstName,
          surname: request.surname,
        };
      } else if (request.type === eventTypes.EMPLOYEE_DELETED) {
        currentLeaveAmount = request.amount;
      }
    }
  }
  // no snapshot
  else {
    for (const request of sortedRequests) {
      if (
        request.type === eventTypes.EMPLOYEE_CREATED ||
        request.type === eventTypes.EMPLOYEE_UPDATED
      ) {
        currentEmployee = {
          firstName: request.firstName,
          surname: request.surname,
        };
      } else if (request.type === eventTypes.LEAVE_REQUESTED) {
        currentLeaveAmount -= request.amount;
      } else if (request.type === eventTypes.LEAVE_CANCELLED) {
        currentLeaveAmount += request.amount;
      } else if (request.type === eventTypes.EMPLOYEE_DELETED) {
        currentLeaveAmount = request.amount;
      }
    }
  }

  return {
    id,
    firstName: currentEmployee.firstName,
    surname: currentEmployee.surname,
    amount: currentLeaveAmount,
    version: getCurrentVersion(requests),
    lastUpdated: getLastUpdatedDate(requests),
  };
}
