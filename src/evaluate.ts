import { Predicate, Message, OpenAIModel } from "./models";
import { OpenAIApi, Configuration } from "openai";

export type EvaluatorOptions = {
  readonly inputPrompts: Message[];
  readonly evalPrompts: Predicate[];
  readonly numTrials: number;
};

abstract class Evaluator {
  protected inputPrompts: Message[];
  protected predicates: Predicate[];
  protected numTrials: number;

  constructor(options: EvaluatorOptions) {
    this.inputPrompts = options.inputPrompts;
    this.numTrials = options.numTrials;
    this.predicates = options.evalPrompts;
  }

  async evaluate(): Promise<Record<string, string[]>> {
    // TODO: Check that predicates are unique
    if (this.predicates.length === 0) {
      throw new Error("No predicates were provided");
    }

    const responsePredicateMatches: Record<string, string[]> = {};

    const responses: string[] = [];
    for (let trialNum = 0; trialNum < this.numTrials; trialNum++) {
      const inputPromptResponse = await this.getInputPromptResponse();
      if (inputPromptResponse === undefined)
        throw new Error("Model returned an empty response");
      responses.push(inputPromptResponse);
    }

    for (const targetResponse of responses) {
      for (const predicate of this.predicates) {
        const didPassEval = await this.applyPredicate(
          predicate,
          targetResponse
        );

        if (didPassEval) {
          if (responsePredicateMatches[targetResponse]) {
            const isSeen = responsePredicateMatches[targetResponse].includes(
              predicate.id
            );
            if (!isSeen)
              responsePredicateMatches[targetResponse].push(predicate.id);
          } else {
            responsePredicateMatches[targetResponse] = [predicate.id];
          }
        }
      }
    }
    return responsePredicateMatches;
  }

  abstract getInputPromptResponse(): Promise<string | undefined>;

  async applyPredicate(
    predicate: Predicate,
    inputPromptResponse: string
  ): Promise<boolean> {
    switch (predicate.type) {
      case "regexp":
        return this.applyRegexPredicate(predicate.content, inputPromptResponse);
      case "prompt":
        return this.applyPromptPredicate(
          predicate.content,
          inputPromptResponse
        );
    }
  }

  async applyRegexPredicate(
    regExp: string,
    inputPromptResponse: string
  ): Promise<boolean> {
    const regex = new RegExp(regExp);
    return regex.test(inputPromptResponse);
  }

  abstract applyPromptPredicate(
    prompt: string,
    inputPromptResponse: string
  ): Promise<boolean>;
}

export class OpenAiEvaluator extends Evaluator {
  private openai: OpenAIApi;
  private model: OpenAIModel;

  constructor(
    openAiApiKey: string,
    model: OpenAIModel,
    options: EvaluatorOptions
  ) {
    super(options);
    this.openai = new OpenAIApi(new Configuration({ apiKey: openAiApiKey }));
    this.model = model;
  }

  async getInputPromptResponse(): Promise<string | undefined> {
    const response = await this.openai.createChatCompletion({
      messages: this.inputPrompts,
      model: this.model,
      temperature: 0.99,
    });

    return response.data.choices[0].message?.content;
  }

  async applyPromptPredicate(
    prompt: string,
    inputPromptResponse: string
  ): Promise<boolean> {
    const structuredQuestion: Message = {
      role: "user",
      content: `${prompt}? Answer 'yes' or 'no' only.\n"""\n${inputPromptResponse}\n"""`,
    };

    const response = await this.openai.createChatCompletion({
      messages: [structuredQuestion],
      model: this.model,
      temperature: 0.99,
    });

    const responseText = response.data.choices[0].message?.content;

    if (responseText === undefined)
      throw new Error(`Error applying prompt predicate: ${prompt}`);
    return responseText?.toLowerCase().includes("yes");
  }
}

export class MockEvaluator extends Evaluator {
  private responseCount: number = 0;

  constructor(options: EvaluatorOptions) {
    super(options);
  }

  async getInputPromptResponse(): Promise<string | undefined> {
    this.responseCount++;
    return `This is a mock response ${this.responseCount}`;
  }
  applyPromptPredicate(
    prompt: string,
    inputPromptResponse: string
  ): Promise<boolean> {
    return new Promise((resolve) => resolve(true));
  }
}
