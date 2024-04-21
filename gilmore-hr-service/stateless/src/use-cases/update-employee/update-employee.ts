import {
  Event,
  Events,
  createSnapshot,
  eventTypes,
  getCurrentEmployeeView,
  updateEmployee,
} from '@aggregates/employee-aggregate';
import { getEvents, save } from '@repositories/employee-repository';

import { Employee } from '@dto/employee';
import { UpdateEmployeeCommand } from '@dto/update-employee';
import { schema } from '@schemas/employee';
import { schemaValidator } from '@shared';

export async function updateEmployeeUseCase(
  updateEmployeeCommand: UpdateEmployeeCommand
): Promise<Employee> {
  updateEmployeeCommand.type = 'UPDATE_EMPLOYEE';

  // get the records to build the aggregate for a specific id
  const events: Events = await getEvents(updateEmployeeCommand.id);

  // read all past events for the aggregate to reconstitute the current state
  const currentState = getCurrentEmployeeView(events, updateEmployeeCommand.id);

  // create the command which produces a new event
  const newEvent: Event = updateEmployee(currentState, updateEmployeeCommand);

  // get the current state using the event produced and previous events
  const newState = getCurrentEmployeeView([...events, newEvent], newEvent.id);

  // ensure the event is valid
  schemaValidator(schema, newState);

  // save new event & snaphot in a transaction (we dont save the current state just the event itself)
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
    createSnapshot(events)
  );

  return newState;
}
