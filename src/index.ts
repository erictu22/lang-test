#!/usr/bin/env node

import { Command } from "commander";
import { EvaluatorOptions, OpenAiEvaluator } from "./api/evaluate";
import { Message, Predicate } from "./shared/models";

const program = new Command();

program
  .requiredOption("-k, --apiKey <apiKey>", "OpenAI API key")
  .requiredOption("-m, --model <model>", "OpenAI model")
  .requiredOption("-n, --numTrials <numTrials>", "Number of trials")
  .requiredOption(
    "-i, --inputPrompts <inputPrompts>",
    "Input prompts (JSON list)"
  )
  .requiredOption(
    "-e, --evalPrompts <evalPrompts>",
    "Evaluation prompts (JSON list)"
  )
  .parse(process.argv);

const { apiKey, model, numTrials, inputPrompts, evalPrompts } = program.opts();
const evaluatorOptions: EvaluatorOptions = {
  inputPrompts: parseInputPrompts(inputPrompts),
  evalPrompts: parseEvalPrompts(evalPrompts),
  numTrials: parseInt(numTrials),
};

const evaluator = new OpenAiEvaluator(apiKey, model, evaluatorOptions);

(async () => {
  try {
    const result = await evaluator.evaluate();
    console.log("Evaluation result:", result);
  } catch (error) {
    console.error("Error occurred during evaluation:", error);
  }
})();

function parseInputPrompts(inputPrompts: string): Message[] {
  return []; // TODO: implement
}

function parseEvalPrompts(evalPrompts: string): Predicate[] {
  return []; // TODO: implement
}
