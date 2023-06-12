import React from "react";
import styled from "styled-components";
import { Predicate, PredicateType } from "../../../shared/models";

interface PredicateRowProps {
  pred: Predicate;
  handlePredicateChange: (value: Predicate) => void;
  handleDelete: () => void;
}

const PredicateRowContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Select = styled.select`
  margin-right: 10px;
  padding: 5px;
`;

const TextArea = styled.textarea`
  flex: 1;
  margin-right: 8px;
  padding: 4px;
  border-radius: 8;
`;

const Button = styled.button`
  background-color: #ff0000;
  color: #ffffff;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
`;

const PredicateRow: React.FC<PredicateRowProps> = ({
  pred,
  handleDelete,
  handlePredicateChange,
}) => {
  const options: PredicateType[] = ["prompt", "regexp"];

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as PredicateType;
    handlePredicateChange({ ...pred, type });
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handlePredicateChange({ ...pred, id: e.target.value });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handlePredicateChange({ ...pred, content: e.target.value });
  };

  return (
    <PredicateRowContainer>
      <Select value={pred.type} onChange={handleTypeChange}>
        <option value="prompt">Prompt</option>
        <option value="regexp">Regexp</option>
      </Select>
      <TextArea onChange={handleIdChange} />
      <TextArea onChange={handleContentChange} />
      <Button onClick={handleDelete}>Delete</Button>
    </PredicateRowContainer>
  );
};

export default PredicateRow;
