// These mirror the DTO records in the backend (web/dto).

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type BookStatus = 'IN_PROGRESS' | 'FINISHED';

export interface BookSummary {
  id: number;
  title: string;
  coverColor: string;
  status: BookStatus;
  myTurn: boolean;
  partner: string | null;
  entryCount: number;
}

export interface Entry {
  id: number;
  author: string;
  text: string;
  position: number;
  createdAt: string;
}

export interface BookDetail {
  id: number;
  title: string;
  coverColor: string;
  status: BookStatus;
  owner: boolean;
  myTurn: boolean;
  currentTurn: string | null;
  partner: string | null;
  entries: Entry[];
}

export type InvitationStatus = 'OPEN' | 'ACCEPTED' | 'DECLINED';

export interface Invitation {
  code: string;
  bookId: number;
  bookTitle: string;
  invitedBy: string;
  status: InvitationStatus;
}
