// templates/repository.inmemory.ts

import type { EntityRepo, Entity, LocatarioId, EntityId } from "./repository.port";

export class InMemoryEntityRepo implements EntityRepo {
  // Map por locatário -> Map por id
  private db = new Map<LocatarioId, Map<EntityId, Entity>>();

  private bucket(locatarioId: LocatarioId): Map<EntityId, Entity> {
    const existing = this.db.get(locatarioId);
    if (existing) return existing;
    const created = new Map<EntityId, Entity>();
    this.db.set(locatarioId, created);
    return created;
  }

  async findById(locatarioId: LocatarioId, id: EntityId): Promise<Entity | null> {
    const b = this.bucket(locatarioId);
    return b.get(id) ?? null;
  }

  async save(locatarioId: LocatarioId, entity: Entity): Promise<void> {
    const b = this.bucket(locatarioId);
    b.set(entity.id, entity);
  }

  async list(locatarioId: LocatarioId): Promise<Entity[]> {
    const b = this.bucket(locatarioId);
    return Array.from(b.values());
  }
}