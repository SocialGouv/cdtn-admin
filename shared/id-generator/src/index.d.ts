import { v4 as uuid} from "uuid";

type generatedId = {
    cdtn_id: string
    initial_id: typeof uuid
  }

declare module '@shared/id-generator' {
  export const maxIdLength: number

  export function generateCdtnId(content: string, maxIdLength: number): string

  export function generateInitialId(): typeof uuid

  export function generateIds(source: string, maxIdLength: string): generatedId
}
