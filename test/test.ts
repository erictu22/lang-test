import { EvaluatorOptions, MockEvaluator } from "../src/api/evaluate";
import { Predicate } from "../src/shared/models";

describe("MockEvaluator", () => {
  const options: EvaluatorOptions = {
    inputPrompts: [{ role: "user", content: "What's 2 + 2?" }],
    evalPrompts: [{ type: "prompt", id: "test", content: "is it 4?" }],
    numTrials: 1,
  };

  describe("constructor", () => {
    it("should create a new instance of MockEvaluator", () => {
      const evaluator = new MockEvaluator(options);
      expect(evaluator).toBeInstanceOf(MockEvaluator);
    });
  });

  describe("getInputPromptResponse", () => {
    it("should return a mock response", async () => {
      const evaluator = new MockEvaluator(options);
      const response = await evaluator.getInputPromptResponse();
      expect(response).toEqual("This is a mock response 1");
    });
  });

  describe("applyPredicate", () => {
    it("should return true when applying a prompt predicate", async () => {
      const evaluator = new MockEvaluator(options);
      const promptPredicate: Predicate = {
        type: "prompt",
        id: "test",
        content: "world",
      };
      const response = await evaluator.applyPredicate(
        promptPredicate,
        "is this a numbered response?"
      );
      expect(response).toEqual(true);
    });

    it("should return true when applying a regex predicate", async () => {
      const evaluator = new MockEvaluator(options);
      const regexPredicate: Predicate = {
        type: "regexp",
        id: "test",
        content: "\\d+",
      };
      const response = await evaluator.applyPredicate(regexPredicate, "123");
      expect(response).toEqual(true);
    });
  });

  describe("evaluate", () => {
    it("should return a record of responses and their respective matching predicates for 1 trial", async () => {
      const evaluator = new MockEvaluator({
        inputPrompts: [
          { role: "user", content: "What is 2+2?" },
        ],
        evalPrompts: [
          { type: "prompt", id: "1", content: "Is the output a number?" },
          { type: "prompt", id: "2", content: "Is it 4?"},
          { type: "regexp", id: "3", content: "\\bmock\\b"},
          { type: "regexp", id: "4", content: "\\cat\\b"}
        ],
        numTrials: 1,
      });
      const response = await evaluator.evaluate();
      expect(response).toEqual({
        "This is a mock response 1" : ["1","2","3"]
      });
    });

    it("should return a record of responses and their respective matching predicates for two trials", async () => {
      const evaluator = new MockEvaluator({
        inputPrompts: [
          { role: "user", content: "What is 2+2?" },
        ],
        evalPrompts: [
          { type: "prompt", id: "1", content: "Is the output a number?" },
          { type: "prompt", id: "2", content: "Is it 4?"},
          { type: "regexp", id: "3", content: "\\bmock\\b"},
          { type: "regexp", id: "4", content: "\\cat\\b"},
          { type: "regexp", id: "4", content: "\\bresponse 2\\b"}
        ],
        numTrials: 2,
      });
      const response = await evaluator.evaluate();
      expect(response).toEqual({
        "This is a mock response 1" : ["1","2","3"],
        "This is a mock response 2" : ["1","2","3","4"]
      });
    });

    it("should throw an error if the model returns an empty response", async () => {
      const evaluator = new MockEvaluator({
        inputPrompts: [{ role: "user", content: "" }],
        evalPrompts: [],
        numTrials: 1,
      });
      await expect(evaluator.evaluate()).rejects.toThrow(
        "No predicates were provided"
      );
    });
  });
});
