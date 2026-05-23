export interface PipelineConfig {
  pipelineId: number;
  name: string;
  targetBranch: string;
}

export interface ProjectConfig {
  name: string;
  pipelines: PipelineConfig[];
}

export interface Config {
  projects: ProjectConfig[];
}
