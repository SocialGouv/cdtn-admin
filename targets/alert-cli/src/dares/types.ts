export interface Diff {
  ccManquante: ConventionCollective[];
  ccEnTrop: ConventionCollective[];
}

export interface ConventionCollective {
  name: string;
  num: number;
}
