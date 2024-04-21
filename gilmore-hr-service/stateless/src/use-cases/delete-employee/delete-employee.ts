import {
  Event,
  Events,
  deleteEmployee,
  eventTypes,
  getCurrentEmployeeView,
} from '@aggregates/employee-aggregate';
import { getEvents, save } from '@repositories/employee-repository';

import { DeleteEmployeeCommand } from '@dto/delete-employee';
import { Employee } from '@dto/employee';
import { schema } from '@schemas/employee';
import { schemaValidator } from '@shared';

export async function deleteEmployeeUseCase(
  deleteEmployeeCommand: DeleteEmployeeCommand
): Promise<Employee> {
  deleteEmployeeCommand.type = 'DELETE_EMPLOYEE';

  // get the records to build the aggregate for a specific id
  const events: Events = await getEvents(deleteEmployeeCommand.id);

  // read all past events for the aggregate to reconstitute the current state
  const currentState = getCurrentEmployeeView(events, deleteEmployeeCommand.id);

  // create the command which produces a new event
  const newEvent: Event = deleteEmployee(currentState, deleteEmployeeCommand);

  // get the current state using the event produced and previous events
  const newState = getCurrentEmployeeView([...events, newEvent], newEvent.id);

  // ensure the event is valid
  schemaValidator(schema, newState);

  // save the new employee deleted event
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
    true
  );

  return newState;
}
