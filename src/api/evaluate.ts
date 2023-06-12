import { response } from "express";
import { Predicate, Message, OpenAIModel } from "../shared/models";
import { OpenAIApi, Configuration } from "openai";

export type EvaluatorOptions = {
  readonly inputPrompts: Message[];
  readonly predicates: Predicate[];
  readonly numTrials: number;
};

abstract class Evaluator {
  protected inputPrompts: Message[];
  protected predicates: Predicate[];
  protected numTrials: number;

  constructor(options: EvaluatorOptions) {
    this.inputPrompts = options.inputPrompts;
    this.numTrials = options.numTrials;
    this.predicates = options.predicates;
  }

  async evaluate(): Promise<Record<string, number>> {
    const set = new Set(this.predicates.map((p) => p.id));
    if (set.size !== this.predicates.length) {
      throw new Error("Predicate ids must be unique");
    }

    if (this.predicates.length === 0) {
      throw new Error("No predicates were provided");
    }

    const responsePredicateMatches: Record<string, number> = {};

    const responsePromises: Promise<void>[] = [];
    for (let trialNum = 0; trialNum < this.numTrials; trialNum++) {
      const evaulation = this.fetchPromptResponse().then(
        async (targetResponse) => {
          if (targetResponse === undefined)
            throw new Error("Model returned an empty response");
          await this.evaluateResponse(targetResponse, responsePredicateMatches);
        }
      );
      responsePromises.push(evaulation);
    }

    await Promise.all(responsePromises);
    return responsePredicateMatches;
  }

  async evaluateResponse(
    targetResponse: string,
    responsePredicateMatches: Record<string, number>
  ) {
    for (const predicate of this.predicates) {
      const didPassEval = await this.applyPredicate(predicate, targetResponse);

      if (!responsePredicateMatches[predicate.id])
        responsePredicateMatches[predicate.id] = 0;

      if (didPassEval) {
        responsePredicateMatches[predicate.id]++;
      }
    }
  }

  abstract fetchPromptResponse(): Promise<string | undefined>;

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
  private maxTokens: number;

  constructor(
    openAiApiKey: string,
    model: OpenAIModel,
    maxTokens: number,
    options: EvaluatorOptions
  ) {
    super(options);
    this.openai = new OpenAIApi(new Configuration({ apiKey: openAiApiKey }));
    this.model = model;
    this.maxTokens = maxTokens;
  }

  async fetchPromptResponse(): Promise<string | undefined> {
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
      max_tokens: this.maxTokens,
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

  async fetchPromptResponse(): Promise<string | undefined> {
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
