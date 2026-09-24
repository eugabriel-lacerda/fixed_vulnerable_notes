import type { FormEvent } from "react";

export type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onClear: () => void;
};
