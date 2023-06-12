interface InputProps {
  value: string;
  onChange: (value: string) => void;
}

export const PredicateInput: React.FC<InputProps> = ({
  value,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    onChange(e.target.value);

  return (
    <li>
      <textarea value={value} onChange={handleChange} />
    </li>
  );
};

export const PromptInput: React.FC<InputProps> = ({
  value,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return <textarea value={value} onChange={handleChange} />;
};
