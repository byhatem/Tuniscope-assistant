
export enum Sender {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export interface Source {
  uri: string;
  title: string;
}

export interface Message {
  id: number;
  text: string;
  sender: Sender;
  sources?: Source[];
}
