import { Command } from "commander";
import { EvaluatorOptions, OpenAiEvaluator } from "./api/evaluate";
import { Message, Predicate } from "./shared/models";

const program = new Command();

program
  .requiredOption("-k, --apiKey <apiKey>", "OpenAI API key")
  .requiredOption("-m, --model <model>", "OpenAI model")
  .requiredOption("-n, --numTrials <numTrials>", "Number of trials")
  .requiredOption(
    "-p, --targetPrompt <targetPrompt>",
    "The target prompt for testing"
  )
  .requiredOption(
    "-e, --predicates <predicates>",
    'Predicates (Example format [{"type": "prompt", "id": "1", "content": "Is the output a number?"}])'
  )
  .requiredOption("-t, --maxTokens <maxTokens>", "Max tokens")
  .parse(process.argv);

const { apiKey, model, numTrials, targetPrompt, predicates, maxTokens } =
  program.opts();
const evaluatorOptions: EvaluatorOptions = {
  prompt: [{ role: "user", content: targetPrompt }],
  predicates: parsePredicates(predicates),
  numTrials: parseInt(numTrials),
};

const evaluator = new OpenAiEvaluator(
  apiKey,
  model,
  parseInt(maxTokens),
  evaluatorOptions
);

(async () => {
  try {
    const result = await evaluator.evaluate();
    console.log(result);
  } catch (error) {
    console.error("Error occurred during evaluation:", error);
  }
})();

function parsePredicates(predicateStr: string): Predicate[] {
  const predicateListObj: any = JSON.parse(predicateStr);

  // verify that the object conforms to the Predicate interface
  if (!Array.isArray(predicateListObj)) {
    throw new Error("Predicates must be an array");
  }

  for (const predicate of predicateListObj) {
    if (!("type" in predicate)) {
      throw new Error("Predicate must have a type");
    }
    if (!("id" in predicate)) {
      throw new Error("Predicate must have an id");
    }
    if (!("content" in predicate)) {
      throw new Error("Predicate must have content");
    }
  }

  return predicateListObj; // TODO: implement
}
