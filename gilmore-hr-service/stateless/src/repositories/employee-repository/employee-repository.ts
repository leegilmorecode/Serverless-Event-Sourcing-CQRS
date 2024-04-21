import {
  create,
  createWithSnapshot,
  list,
} from '@adapters/secondary/database-adapter';
import { Event, Events } from '@aggregates/employee-aggregate';

import { logger } from '@shared';

export async function getEvents(id: string): Promise<Events> {
  return (await list(id)) as Events;
}

export async function createEmployee(event: Event): Promise<void> {
  return await create(event);
}

export async function save(
  event: Event,
  snapshot: Event,
  createSnapshot: boolean = false
): Promise<void> {
  logger.info(
    `save - event: ${JSON.stringify(event)}, snapshot: ${JSON.stringify(
      snapshot
    )}`
  );

  // persist the event on its own or with a snapshot
  if (!createSnapshot) {
    await create(event);
  } else {
    await createWithSnapshot(event, snapshot);
  }
}
