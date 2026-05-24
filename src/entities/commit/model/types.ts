export interface Commit {
  hash: string;
  authorEmail: string;
  commitDate: string;
  merge: boolean;
  addedLines: number;
  deletedLines: number;
  testAddedLines: number;
  message: string;
  taskNumber: string | null;
  repo: string;
}
