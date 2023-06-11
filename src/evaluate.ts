import { Message, Model } from "./models";
import { OpenAIApi, Configuration } from "openai";

type EvaluatorOptions = {
  readonly inputPrompts: Message[];
  readonly evalPrompts: string[];
  readonly numTrials: number;
};

abstract class Evaluator {
  protected inputPrompts: Message[];
  protected evalPrompts: string[];
  protected numTrials: number;

  constructor(options: EvaluatorOptions) {
    this.inputPrompts = options.inputPrompts;
    this.numTrials = options.numTrials;
    this.evalPrompts = options.evalPrompts;
  }

  async evaluate(): Promise<Record<string, number>> {
    const output: Record<string, number> = {};
    for (let i = 0; i < this.numTrials; i++) {
      const inputPromptResponse = await this.getInputPromptResponse();
      if (inputPromptResponse === undefined)
        throw new Error("Model returned an empty response");
      for (const evalPrompt in this.evalPrompts) {
        const didPassEval = await this.getEvaluation(
          evalPrompt,
          inputPromptResponse
        );
        if (didPassEval) {
          output[evalPrompt] ? output[evalPrompt]++ : (output[evalPrompt] = 1);
        }
      }
    }
    return output;
  }

  abstract getInputPromptResponse(): Promise<string | undefined>;

  abstract getEvaluation(
    evalPrompt: string,
    inputPromptResponse: string
  ): Promise<boolean>;
}

class OpenAiEvaluator extends Evaluator {
  private openai: OpenAIApi;
  private model: Model;

  constructor(apiKey: string, model: Model, options: EvaluatorOptions) {
    super(options);
    this.openai = new OpenAIApi(new Configuration({ apiKey }));
    this.model = model;
  }

  async getInputPromptResponse(): Promise<string | undefined> {
    const response = await this.openai.createChatCompletion({
      messages: this.inputPrompts,
      model: this.model,
      temperature: 0.99,
    });

    if (response.data.choices.length === 0)
      throw new Error("An error with OpenAI has occured");
    return response.data.choices[0].message?.content;
  }

  async getEvaluation(
    evalPrompt: string,
    inputPromptResponse: string
  ): Promise<boolean> {
    const structuredQuestion: Message = {
      role: "user",
      content: `${evalPrompt}? Answer 'yes' or 'no' only.\n"""\n${inputPromptResponse}\n"""`,
    };

    const response = await this.openai.createChatCompletion({
      messages: [structuredQuestion],
      model: this.model,
      temperature: 0.99,
    });

    const responseText = response.data.choices[0].message?.content;
    return responseText === "yes";
  }
}

class MockEvaluator extends Evaluator {
  constructor(options: EvaluatorOptions) {
    super(options);
  }

  async getInputPromptResponse(): Promise<string | undefined> {
    return "This is a mock response";
  }

  async getEvaluation(
    evalPrompt: string,
    inputPromptResponse: string
  ): Promise<boolean> {
    return true;
  }
}
