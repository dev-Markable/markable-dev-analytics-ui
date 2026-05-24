export interface UnifiedUser {
  id: number;
  email: string;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
  kaitenId: number | null;
  gitlabId: number | null;
}

export interface AuthorActivity {
  email: string;
  commits: number;
  mergeCommits: number;
  addedLines: number;
  deletedLines: number;
  testAddedLines: number;
}
