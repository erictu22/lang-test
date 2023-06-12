# LangTest
A prompt testing framework

# CLI

A Command Line Interface (CLI) to evaluate OpenAI models based on a set of user-defined predicates.

## Installation

This CLI requires Node.js version 14 or higher.

To install, clone the repository and then run the following command within the cloned directory:

```
npm install
```

## Usage

To run the CLI, use the following command:

```
node index.js
```

The CLI options are as follows:

- `-k, --apiKey <apiKey>` (required): The OpenAI API key.
- `-m, --model <model>` (required): The OpenAI model.
- `-n, --numTrials <numTrials>` (required): Number of trials to run.
- `-p, --targetPrompt <targetPrompt>` (required): The target prompt to test the model with.
- `-e, --predicates <predicates>` (required): Predicates (in JSON format). Example format: `'[{"type": "prompt", "id": "1", "content": "Is the output a number?"}]'`.
- `-t, --maxTokens <maxTokens>` (required): The maximum number of tokens to generate in the response.

Example usage:

```
node

# Playground

## OpenAIEvaluator

The `OpenAIEvaluator` is a class used for evaluating the responses of an OpenAI model against a set of predefined predicates. It uses the OpenAI API to generate responses, and applies a set of predicates to each response to determine whether the response is valid or not.

### Importing

The `OpenAIEvaluator` class can be imported as follows:

```javascript
import { OpenAiEvaluator } from "./OpenAIEvaluator";
```

### Constructor

The `OpenAIEvaluator` class has the following constructor:

```javascript
constructor(
    openAiApiKey: string,
    model: OpenAIModel,
    maxTokens: number,
    options: EvaluatorOptions
)
```

- `openAiApiKey`: A string representing the OpenAI API key associated with the account used to access the model.
- `model`: An instance of the `OpenAIModel` class representing the model to use.
- `maxTokens`: An integer representing the maximum number of tokens to generate for each response. This parameter is used by the OpenAI API to control the length of the response generated.
- `options`: An instance of the `EvaluatorOptions` interface representing the options to use when running the evaluation. This interface is defined as follows:

```javascript
interface EvaluatorOptions = {
  readonly inputPrompts: Message[];
  readonly predicates: Predicate[];
  readonly numTrials: number;
  readonly updateHandler?: (update: EvaluationUpdate) => void;
};
```

- `inputPrompts`: An array of `Message` objects representing the messages to use as prompts for generating responses.
- `predicates`: An array of `Predicate` objects representing the predicates to use for evaluating responses.
- `numTrials`: An integer representing the number of times to evaluate the model (i.e. generate a response and apply the predicates).
- `updateHandler` (optional): A function that will be called with an `EvaluationUpdate` object every time a predicate is applied to a response. This function can be used to monitor the progress of the evaluation.

### Methods

The `OpenAIEvaluator` class has the following methods:

#### evaluate

```javascript
async evaluate(): Promise<Record<string, number>>
```

This method generates responses using the OpenAI API and applies the set of predicates to each response. It returns a dictionary containing the number of times each predicate passed.

#### fetchPromptResponse

```javascript
async fetchPromptResponse(): Promise<string | undefined>
```

This method generates a response using the OpenAI API based on the input prompts provided in the `EvaluatorOptions`. It returns the response as a string, or `undefined` if the response was empty or could not be generated.

#### applyPromptPredicate

```javascript
async applyPromptPredicate(
    prompt: string,
    inputPromptResponse: string
): Promise<boolean>
```

This method applies the "prompt" type of predicate to a response. It takes a string `prompt` representing the prompt to use for generating the response, and a string `inputPromptResponse` representing the response to which the prompt is being applied. It returns a boolean indicating whether the predicate passed or failed.

### Example usage

```javascript
import { OpenAIApi } from "openai";
import { OpenAIModel } from "../shared/models";
import { OpenAiEvaluator } from "./OpenAIEvaluator";

const evaluationOptions = {
  inputPrompts: [
    {
      role: "user",
      content: "This is the prompt for the response"
    }
  ],
  predicates: [
    {
      id: "predicate1",
      type: "prompt",
      content: "Does the response contain the word 'apple'?"
    },
    {
      id: "predicate2",
      type: "regexp",
      content: ".*banana.*"
    }
  ],
  numTrials: 10
};

const openAiApiKey = "YOUR_API_KEY_HERE";
const openai = new OpenAIApi({ apiKey: openAiApiKey });
const model = new OpenAIModel("your-model-ID");
const maxTokens = 100;

const evaluator = new OpenAiEvaluator(openAiApiKey, model, maxTokens, evaluationOptions);
const results = await evaluator.evaluate();

console.log(results);
```

This example creates a new `OpenAIEvaluator` object and runs an evaluation of the OpenAI model specified by `model`. The evaluation generates responses using the input prompt provided, and applies two predicates to each response to determine whether the response contains the word "apple" and whether it matches the regular expression ".*banana.*". The evaluation is run 10 times, and the results are printed to the console.