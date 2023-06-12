import { EvaluatorOptions, OpenAiEvaluator } from "./api/evaluate";
import { OpenAIModel } from "./shared/models";

const evaluationOptions: EvaluatorOptions = {
  prompt: [
    {
      role: "user",
      content: "List me some red and yellow fruits",
    },
  ],
  predicates: [
    {
      id: "Were apples mentioned?",
      type: "prompt",
      content: "Does the following text contain the word 'apple'?",
    },
    {
      id: "Was the exact word 'Banana' mentioned?",
      type: "regexp",
      content: ".*Banana.*",
    },
  ],
  numTrials: 10,
  updateHandler: (update) => {
    console.log(
      `Applying "${update.predicateId}" to "${update.targetResponse}"`
    );
    console.log(`response ${update.didPass ? "passed" : "failed"}`);
  },
};

const openAiApiKey = "<OPENAI_API_KEY>";
const model: OpenAIModel = "gpt-3.5-turbo";
const maxTokens = 100;

const evaluator = new OpenAiEvaluator(
  openAiApiKey,
  model,
  maxTokens,
  evaluationOptions
);
evaluator.evaluate().then((results) => console.log(results));
