// api/summarization.ts
import Anthropic from '@anthropic-ai/sdk';
import { config } from 'dotenv';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

config();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const TOS_PROMPT = `
Analyze the following Terms of Service document and produce a JSON response that simplifies the key sections for a general audience. If certain key sections (such as "Data Collection", "User Rights", "Limitations of Liability", "Cancellation & Termination") exist, summarize them. Additionally, evaluate the document for any potential dangers or unfavorable terms to the user, such as excessive data collection, limited user rights, or other restrictive conditions. Highlight these in a separate section within the JSON.

Input Document: {content}

Expected JSON Output Format:
{
  "summary": {
    "DataCollection": "Summarize this section in simplified terms.",
    "UserRights": "Summarize this section in simplified terms.",
    "LimitationsOfLiability": "Summarize this section in simplified terms.",
    "CancellationAndTermination": "Summarize this section in simplified terms."
  },
  "potentialDangers": [
    "Highlight any sections that may pose a risk to the user, such as excessive data collection or unfair user restrictions."
  ],
  "overallAssessment": "Indicate whether the terms of service are generally favorable or unfavorable to the user, based on the summaries and identified potential dangers.",
}

Please ensure the response strictly follows this JSON structure. Wrap the JSON response in triple backticks (\`\`\`) to ensure it is properly formatted.
`;

async function processWithAnthropic(content: string) {
  const response = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: TOS_PROMPT.replace("{content}", content)
      }
    ],
  });

  const processedText = response.content?.[0]?.text || "Error: Unable to process content.";
  const jsonMatch = processedText.match(/```([\s\S]*)```/);

  if (jsonMatch) {
    return jsonMatch[1].trim();
  } else {
    console.error("Error: Unable to extract JSON from the processed content.");
    return "{}";
  }
}

async function processWithOpenAI(content: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: TOS_PROMPT.replace("{content}", content)
      }
    ],
  });

  const processedText = response.choices[0].message?.content || "Error: Unable to process content.";
  const jsonMatch = processedText.match(/```([\s\S]*)```/);

  if (jsonMatch) {
    return jsonMatch[1].trim();
  } else {
    console.error("Error: Unable to extract JSON from the processed content.");
    return "{}";
  }
}

async function createBatchFile(contents: string[]) {
  const batchFilePath = path.join(__dirname, 'batch_input.jsonl');
  const batchFile = fs.createWriteStream(batchFilePath);

  contents.forEach((content, index) => {
    const request = {
      custom_id: `request-${index}`,
      method: "POST",
      url: "/v1/chat/completions",
      body: {
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: TOS_PROMPT.replace("{content}", content) }
        ],
        max_tokens: 1000
      }
    };
    batchFile.write(JSON.stringify(request) + '\n');
  });

  batchFile.end();
  return batchFilePath;
}

async function processBatch(contents: string[]) {
  const batchFilePath = await createBatchFile(contents);
  const batchInputFile = await openai.files.create({
    file: fs.createReadStream(batchFilePath),
    purpose: 'batch'
  });

  const batch = await openai.batches.create({
    input_file_id: batchInputFile.id,
    endpoint: "/v1/chat/completions",
    completion_window: "24h",
    metadata: { description: "ToS update job" }
  });

  return batch.id;
}

async function getBatchResults(batchId: string) {
  const batch = await openai.batches.retrieve(batchId);
  if (batch.status === 'completed') {
    const outputFileId = batch.output_file_id;
    const response = await openai.files.content(outputFileId);
    const content = await response.text(); // Ensure the content is read as text
    const batchOutputFilePath = path.join(__dirname, 'batch_output.jsonl');
    fs.writeFileSync(batchOutputFilePath, content);
    return batchOutputFilePath;
  } else {
    console.error("Batch processing not completed yet.");
    return null;
  }
}

export async function processContent(content: string) {
  try {
    return await processWithAnthropic(content);
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.warn('Rate limit exceeded for Anthropic API, switching to OpenAI:', error.message);
      return await processWithOpenAI(content);
    } else {
      console.error('Error processing content with Anthropic:', error.message);
      return "{}";
    }
  }
}

export async function processBatchContent(contents: string[]) {
  const batchId = await processBatch(contents);
  console.log(`Batch created with ID: ${batchId}`);

  // Wait for batch to complete (this can be improved with a more robust waiting mechanism)
  await new Promise(resolve => setTimeout(resolve, 60 * 60 * 1000)); // Wait for 1 hour

  const batchOutputFilePath = await getBatchResults(batchId);
  if (batchOutputFilePath) {
    const results = [];
    const lines = fs.readFileSync(batchOutputFilePath, 'utf-8').split('\n');
    for (const line of lines) {
      if (line.trim()) {
        const result = JSON.parse(line);
        const jsonMatch = result.response.body.match(/```([\s\S]*)```/);
        if (jsonMatch) {
          results.push(jsonMatch[1].trim());
        } else {
          console.error("Error: Unable to extract JSON from the processed content.");
          results.push("{}");
        }
      }
    }
    return results;
  } else {
    console.error("Error retrieving batch results.");
    return [];
  }
}