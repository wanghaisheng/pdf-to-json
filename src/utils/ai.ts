import { Configuration, OpenAIApi } from 'openai';

import { sample_schema } from './data_schema';
import { generateSchemaSummaries } from './buildSchemaPrompt';
import { extractText } from './pdf';
import { Schema } from '@Types/schemaTypes';
import { document_metadata_schema } from '@Types/metaDataTypes';
import { createJsonObject } from './generateObject';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const aiPdfHandler = async (fileBuffer: Buffer) => {
  // Extract the text from the PDF
  const documentText = await extractText(fileBuffer);

  let metadata;
  try {
    metadata = await getDocumentMetaData(documentText);
  } catch (error) {
    console.error('Error getting document metadata:', error);
  }

  const schemaToUse = sample_schema;

  const prompts = buildPromptArray(metadata, documentText, schemaToUse);

  const aiResponsesPromises = prompts.map(prompt =>
    createChatCompletion(openai, prompt),
  );

  try {
    const aiResponses = await Promise.all(aiResponsesPromises);

    const resultJson = createJsonObject(aiResponses, schemaToUse);

    console.log(resultJson);

    return 'hello world!!!!';
    return zipObjects(aiResponses);
  } catch (error) {
    console.error('Error in processing all the API calls:', error);
  }
};

const buildPromptArray = (
  metadata: any,
  documentText: string,
  schema: Schema,
) => {
  const schemaSummaries: string[] = generateSchemaSummaries(schema);

  //loop through each schema summary and build a prompt
  const prompts: string[] = [];

  for (const summary of schemaSummaries) {
    const prompt = buildPrompt(metadata, documentText, summary);
    prompts.push(prompt);
  }

  return prompts;
};

const buildPrompt = (metadata: any, documentText: string, summary: string) => {
  let prompt = `I have the following document text, which from a(n) ${metadata[0]} called ${metadata[0]} :\n\n`;

  prompt += documentText;

  prompt +=
    '\n\nCreate an ordered list as a valid Javascript array with data about this text in the format below:\n\n';

  prompt += summary;

  prompt +=
    '\n\nIf a data field is unknown, use a null value. Respond with only a valid Javascript array in the exact exmaple schema.\n\n###';

  return prompt;
};

const getDocumentMetaData = async (documentText: string) => {
  let prompt = 'I have the following text from a document:\n\n';
  prompt += documentText;
  prompt +=
    '\n\nCreate an ordered list as a valid Javascript array with data about this text in the format below:\n\n';

  prompt += generateSchemaSummaries(document_metadata_schema)[0];

  prompt +=
    '\n\nIf a data field is unknown, use a null value. Respond with only a valid Javascript array in the exact exmaple schema.\n\n###';

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const message = response.data.choices[0]?.message?.content;

  if (!message) {
    throw new Error('No message returned from OpenAI');
  } else {
    return message;
  }
};

const zipObjects = (aiResponse: any[]): any => {
  return Object.assign({}, ...aiResponse);
};

const createChatCompletion = async (
  openai: OpenAIApi,
  prompt: string,
): Promise<any> => {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      temperature: 0.5,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const message = response.data.choices[0]?.message?.content;

    if (!message) {
      throw new Error('No message returned from OpenAI');
    } else {
      return convertArrayStringToJson(message);
    }
  } catch (error: any) {
    console.error('Error creating completion:', error);
    throw error;
  }
};

function convertArrayStringToJson(jsonString: string): string {
  const openedBrackets = (jsonString.match(/\[/g) || []).length;
  const closedBrackets = (jsonString.match(/\]/g) || []).length;
  const missingBrackets = openedBrackets - closedBrackets;

  if (missingBrackets > 0) {
    // Check if the last character is not a double quote
    if (jsonString[jsonString.length - 1] !== '"') {
      jsonString += '"';
    }
    for (let i = 0; i < missingBrackets; i++) {
      jsonString += ']';
    }
  }

  try {
    // Remove leading/trailing white spaces and newline characters
    const trimmedString = jsonString.trim();

    // Remove the trailing comma before the closing bracket
    const fixedString = trimmedString.replace(/,\s*\]$/, ']');

    const afterParse = JSON.parse(fixedString);

    if (missingBrackets > 0) {
      afterParse.pop();
    }

    return afterParse;
  } catch (error) {
    console.error('Error parsing JSON string:', jsonString);

    throw new Error('Error parsing JSON string');
  }
}
function parseData(
  aiResponses: any[],
  schemaToUse: Record<string, import('@Types/schemaTypes').SchemaProperty>,
) {
  throw new Error('Function not implemented.');
}
