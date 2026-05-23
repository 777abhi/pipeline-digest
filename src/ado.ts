import * as azdev from 'azure-devops-node-api';
import { Build, BuildResult, BuildReason } from 'azure-devops-node-api/interfaces/BuildInterfaces';
import { ProjectConfig, PipelineConfig } from './types';

export class ADOClient {
  private connection: azdev.WebApi;

  constructor(orgUrl: string, pat: string) {
    const authHandler = azdev.getPersonalAccessTokenHandler(pat);
    this.connection = new azdev.WebApi(orgUrl, authHandler);
  }

  public async getLatestScheduledBuild(projectName: string, pipelineConfig: PipelineConfig): Promise<Build | null> {
    try {
      const buildApi = await this.connection.getBuildApi();

      // Fetch the latest builds for the given definition and branch
      const builds = await buildApi.getBuilds(
        projectName,
        [pipelineConfig.pipelineId], // definitions
        undefined, // queues
        undefined, // buildNumber
        undefined, // minTime
        undefined, // maxTime
        undefined, // requestedFor
        BuildReason.Schedule, // reasonFilter (only scheduled)
        undefined, // statusFilter
        undefined, // resultFilter
        undefined, // tagFilters
        undefined, // properties
        1, // top (we only want the latest one)
        undefined, // continuationToken
        undefined, // maxBuildsPerDefinition
        undefined, // deletedFilter
        undefined, // queryOrder
        pipelineConfig.targetBranch // branchName
      );

      if (builds && builds.length > 0) {
        return builds[0] || null;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching build for project ${projectName}, pipeline ${pipelineConfig.pipelineId}:`, error);
      return null;
    }
  }

  public async getBuildLogString(projectName: string, buildId: number, maxBytes: number = 10 * 1024 * 1024): Promise<string> {
    try {
      const buildApi = await this.connection.getBuildApi();
      const logs = await buildApi.getBuildLogs(projectName, buildId);

      if (!logs || logs.length === 0) {
        return '';
      }

      let completeLog = '';
      let currentBytes = 0;

      // Ensure logs are sorted by ID or sequence to maintain chronological order
      const sortedLogs = logs.sort((a, b) => (a.id || 0) - (b.id || 0));

      for (const log of sortedLogs) {
        if (!log.id) continue;

        try {
          const lines = await buildApi.getBuildLogLines(projectName, buildId, log.id);
          if (lines && lines.length > 0) {
            const logContent = lines.join('\n') + '\n';
            const byteLength = Buffer.byteLength(logContent, 'utf8');

            if (currentBytes + byteLength > maxBytes) {
              const remainingBytes = maxBytes - currentBytes;
              // Truncate safely, but we can just substring based on roughly remaining chars
              // To be exact, we can use Buffer to truncate exactly at remaining bytes
              const buf = Buffer.from(logContent, 'utf8');
              completeLog += buf.toString('utf8', 0, remainingBytes);
              completeLog += '\n...[TRUNCATED DUE TO 10MB LIMIT]...\n';
              break;
            } else {
              completeLog += logContent;
              currentBytes += byteLength;
            }
          }
        } catch (logError) {
           console.error(`Failed to fetch lines for log id ${log.id}`, logError);
        }
      }

      return completeLog;
    } catch(error) {
      console.error(`Error fetching build logs for project ${projectName}, build ${buildId}:`, error);
      return '';
    }
  }
}
