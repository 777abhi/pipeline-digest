import { loadEnvironment, loadConfig } from './config';
import { ADOClient } from './ado';
import { processLogs } from './processor';
import { generateMarkdown, saveMarkdown, Metadata } from './generator';
import { BuildResult } from 'azure-devops-node-api/interfaces/BuildInterfaces';

async function main() {
  try {
    const { orgUrl, pat } = loadEnvironment();
    console.log('Environment loaded successfully.');

    const config = loadConfig();
    console.log(`Loaded config with ${config.projects.length} projects.`);

    const adoClient = new ADOClient(orgUrl, pat);

    for (const projectConfig of config.projects) {
      console.log(`Processing project: ${projectConfig.name}`);

      for (const pipelineConfig of projectConfig.pipelines) {
        console.log(`  Processing pipeline: ${pipelineConfig.name} (ID: ${pipelineConfig.pipelineId})`);

        try {
          const latestBuild = await adoClient.getLatestScheduledBuild(projectConfig.name, pipelineConfig);

          if (!latestBuild || !latestBuild.id) {
            console.log(`    No scheduled builds found for branch ${pipelineConfig.targetBranch}. Skipping.`);
            continue;
          }

          console.log(`    Found latest build: ${latestBuild.buildNumber} (ID: ${latestBuild.id})`);

          const rawLog = await adoClient.getBuildLogString(projectConfig.name, latestBuild.id);
          const { cleanLog, snippets } = processLogs(rawLog);

          let statusStr = "Unknown";
          if (latestBuild.result === BuildResult.Succeeded) statusStr = "Succeeded";
          else if (latestBuild.result === BuildResult.Failed) statusStr = "Failed";
          else if (latestBuild.result === BuildResult.PartiallySucceeded) statusStr = "PartiallySucceeded";
          else if (latestBuild.result === BuildResult.Canceled) statusStr = "Canceled";

          const metadata: Metadata = {
            project: projectConfig.name,
            pipelineId: pipelineConfig.pipelineId,
            pipelineName: pipelineConfig.name,
            buildNumber: latestBuild.buildNumber || 'unknown',
            status: statusStr,
            timestamp: new Date().toISOString(),
          };

          const markdownContent = generateMarkdown(metadata, cleanLog, snippets);
          saveMarkdown(projectConfig.name, pipelineConfig.name, markdownContent);

        } catch (pipelineError) {
          console.error(`    Error processing pipeline ${pipelineConfig.name}:`, pipelineError);
          // Continue to next pipeline
        }
      }
    }

    console.log('Finished processing all projects and pipelines.');
  } catch (error) {
    console.error('Error starting PipelineDigest:', error);
    process.exitCode = 1;
  }
}

main();