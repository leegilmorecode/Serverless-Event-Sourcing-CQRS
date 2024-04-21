import { Events, getCurrentEmployeeView } from '@aggregates/employee-aggregate';

import { Employee } from '@dto/employee';
import { getEvents } from '@repositories/employee-repository';

export async function getEmployeeUseCase(id: string): Promise<Employee> {
  let currentState: Employee;

  // get the records to build the aggregate for a specific id
  const events: Events = await getEvents(id);

  // read all past events for the aggregate to reconstitute the current state
  currentState = getCurrentEmployeeView(events, id);

  return currentState;
}
