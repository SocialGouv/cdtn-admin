export as namespace idGenerator

export type generatedId = {
  cdtn_id: string
  initial_id: string
};

export function generateCdtnId(content: string, maxIdLength?: number): string
export function generateInitialId(): string
export function generateIds(source: string, maxIdLength?: number): generatedId
