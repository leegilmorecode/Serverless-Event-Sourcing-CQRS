import {
  Event,
  Events,
  cancelLeave,
  createSnapshot,
  eventTypes,
  getCurrentEmployeeView,
  requestLeave,
} from '@aggregates/employee-aggregate';
import { getEvents, save } from '@repositories/employee-repository';
import { logger, schemaValidator } from '@shared';

import { Employee } from '@dto/employee';
import { UpdateLeaveCommand } from '@dto/update-leave';
import { ValidationError } from '@errors/validation-error';
import { schema as employeeSchema } from '@schemas/employee';

export async function updateLeaveUseCase(
  updateLeaveCommand: UpdateLeaveCommand
): Promise<Employee> {
  let currentState: Employee;
  let newEvent: Event;

  logger.info(
    `command: ${updateLeaveCommand.type} for id: ${updateLeaveCommand.id} for amount ${updateLeaveCommand.amount}`
  );
  // get the records to build the aggregate for a specific id
  const events: Events = await getEvents(updateLeaveCommand.id);

  // read all past events for the aggregate to reconstitute the current state
  currentState = getCurrentEmployeeView(events, updateLeaveCommand.id);

  // use the correct command which uses our aggregate logic which will throw if not valid (invariants)
  switch (updateLeaveCommand.type) {
    case 'REQUEST_LEAVE':
      newEvent = requestLeave(currentState, updateLeaveCommand);
      break;
    case 'CANCEL_LEAVE':
      newEvent = cancelLeave(currentState, updateLeaveCommand);
      break;
    default:
      throw new ValidationError('Event type error');
  }

  // recreate the new state with the new command to return to the user which we can also use as a snapshot
  const newState = getCurrentEmployeeView(
    [...events, newEvent],
    updateLeaveCommand.id
  );

  // validate the new state
  schemaValidator(employeeSchema, newState);

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
