// templates/repository.port.ts

export type LocatarioId = string;

export type EntityId = string;

export interface Entity {
  id: EntityId;
}

export interface EntityRepo {
  findById(locatarioId: LocatarioId, id: EntityId): Promise<Entity | null>;
  save(locatarioId: LocatarioId, entity: Entity): Promise<void>;
  list(locatarioId: LocatarioId): Promise<Entity[]>;
}