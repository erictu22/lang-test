import React, { useState } from "react";
import { PredicateInput, PromptInput } from "../components/StyledInput";
import PredicateRow from "../components/PredicateRow";

import { Predicate } from "../../../shared/models";

const RequestSection: React.FC = () => {
  const [predicates, setPredicates] = useState<Predicate[]>([]);
  const [prompt, setPrompt] = useState<string>("");

  const handleAddPredicate = () => {
    setPredicates([...predicates, { type: "regexp", id: "", content: "" }]);
  };

  const handlePredicateChange = (
    index: number,
    updatedPredicate: Predicate
  ) => {
    const updatedInputs = [...predicates];
    updatedInputs[index] = updatedPredicate;
    setPredicates(updatedInputs);
  };

  const isButtonDisabled = predicates.some(
    (value) => value.content === "" || value.id === ""
  );

  return (
    <div>
      <h1>Prompt</h1>
      <PromptInput value={prompt} onChange={setPrompt} />
      <h1>Predicates</h1>
      <button onClick={handleAddPredicate} disabled={isButtonDisabled}>
        Add Input
      </button>
      <div>
        {predicates.map((pred, index) => (
          <PredicateRow
            pred={pred}
            handlePredicateChange={(updated: Predicate) =>
              handlePredicateChange(index, updated)
            }
            handleDelete={() => {
              const updatedInputs = [...predicates];
              updatedInputs.splice(index, 1);
              setPredicates(updatedInputs);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default RequestSection;
