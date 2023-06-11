export type Model =
  | "gpt-4"
  | "gpt-4-0314"
  | "gpt-4-32k"
  | "gpt-4-32k-0314"
  | "gpt-3.5-turbo"
  | "gpt-3.5-turbo-0301";

export type Environment = "test" | "prod";

type Role = "system" | "user" | "assistant";

export type Message = {
  role: Role;
  content: string;
};
