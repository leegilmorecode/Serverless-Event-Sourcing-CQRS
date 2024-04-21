import {
  Event,
  createEmployee,
  eventTypes,
  getCurrentEmployeeView,
} from '@aggregates/employee-aggregate';

import { CreateEmployeeCommand } from '@dto/create-employee';
import { Employee } from '@dto/employee';
import { save } from '@repositories/employee-repository';
import { schema } from '@schemas/employee';
import { schemaValidator } from '@shared';

export async function createEmployeeUseCase(
  createEmployeeCommand: CreateEmployeeCommand
): Promise<Employee> {
  createEmployeeCommand.type = 'CREATE_EMPLOYEE';

  // create the command which produces a new event
  const newEvent: Event = createEmployee(createEmployeeCommand);

  // get the current state using the event produced
  const newState = getCurrentEmployeeView([newEvent], newEvent.id);

  // ensure the event is valid
  schemaValidator(schema, newState);

  // save our new employee created event and we dont need a snapshot
  await save(
    newEvent,
    {
      ...newEvent,
      version: newEvent.version + 1,
      type: eventTypes.SNAPSHOT,
      amount: newState.amount,
      firstName: newState.firstName,
      surname: newState.surname,
    },
    false
  );

  return newState;
}
