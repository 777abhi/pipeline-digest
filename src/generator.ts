import * as fs from 'fs';
import * as path from 'path';
import { stringify } from 'yaml';
import { Snippet } from './processor';

export interface Metadata {
  project: string;
  pipelineId: number;
  pipelineName: string;
  buildNumber: string;
  status: string;
  timestamp: string;
}

export function generateMarkdown(metadata: Metadata, cleanLog: string, snippets: Snippet[]): string {
  const frontMatter = stringify(metadata);

  let markdown = `---\n${frontMatter}---\n\n`;

  markdown += `# Pipeline Execution Report: ${metadata.pipelineName}\n\n`;

  if (snippets.length > 0) {
    markdown += `## High Priority Log Snippets\n\n`;
    snippets.forEach((snippet, index) => {
      markdown += `### Match ${index + 1}: \`${snippet.keyword}\`\n`;
      markdown += "```\n";
      markdown += snippet.snippet + "\n";
      markdown += "```\n\n";
    });
  } else {
    markdown += `## High Priority Log Snippets\n\n*No critical failure keywords detected.*\n\n`;
  }

  markdown += `## Complete Execution Logs\n\n`;
  markdown += "```text\n";
  markdown += cleanLog + "\n";
  markdown += "```\n";

  return markdown;
}

export function saveMarkdown(project: string, pipelineName: string, markdownContent: string, outputDir: string = './agent_inputs') {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Sanitize filenames
  const safeProject = project.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const safePipeline = pipelineName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filename = `${safeProject}-${safePipeline}-latest.md`;

  const fullPath = path.join(outputDir, filename);
  fs.writeFileSync(fullPath, markdownContent, 'utf8');
  console.log(`Saved execution report to ${fullPath}`);
}
