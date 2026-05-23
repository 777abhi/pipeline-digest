# pipeline-digest
PipelineDigest acts as the data-acquisition layer for multi-agent systems or automated quality engineering reporting. By processing and organizing raw DevOps noise into clear Markdown profiles, it creates a structured knowledge repository that AI agent skills can instantly digest to prioritize daily engineering actions

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configuration:**
   Update the `config.json` file in the root directory to map your target repositories, pipeline definition IDs, and branches. You will also need to configure your Azure DevOps Personal Access Token (PAT) and organization URL.

3. **Run the Utility:**
   ```bash
   npm start
   ```

# Business Case: Project PipelineDigest
**Author:** Engineering Leadership
**Target Audience:** Engineering Stakeholders & Finance
**Date:** May 2026
## 1. Executive Summary
### The Challenge
Our Quality Engineering (QE) team manages test suites across four primary repositories. Identifying, triaging, and analysing daily test failures requires manual navigation of fragmented Azure DevOps (ADO) pipeline runs. This results in:
 * **High Triage Overhead:** Quality Engineers spend 1.5 to 2 hours every morning locating failures across various dashboards.
 * **Prohibitive LLM Costs:** Raw ADO logs are massive, containing terminal formatting bloat (ANSI escape codes) and verbose dependency installation outputs. Direct feeding of these raw logs to AI agents is economically unviable and exceeds typical context window limits.
 * **Lack of Visibility:** No unified view exists to help teams prioritise daily remediation work.
### The Solution: PipelineDigest
A lightweight, configuration-driven TypeScript utility that runs on a daily schedule. It automatically connects to ADO, extracts the latest scheduled test runs across all target repositories, strips terminal noise, extracts high-priority error traces, and outputs structured Markdown files complete with YAML metadata. These files serve as a clean, token-efficient feed for downstream AI agent skills.
## 2. Productivity & Strategic Value
### Shift from Triage to Remediation
Currently, a QE's morning is consumed by "finding" what broke. **PipelineDigest** compresses this process. Instead of navigating dozens of web pages, QEs (and downstream AI agents) receive a single, unified folder of structured Markdown summaries.

| Activity | Without PipelineDigest (Manual) | With PipelineDigest (Automated) |
| :--- | :--- | :--- |
| **Data Collection** | 30–40 mins (Context switching across 4 repos) | 0 mins (Automated cron execution) |
| **Log Analysis** | 45–60 mins (Scrolling raw text files) | 5 mins (Reviewing extracted failure snippets) |
| **Action Prioritisation** | 15 mins (Discussing which bugs to assign) | Instant (AI-prioritised backlog based on front matter) |
| **Daily Time Spent** | **~2 hours / day per QE** | **< 10 minutes / day** |

### AI Integration & Token Optimisation
Direct CLI integration by LLMs is unreliable and expensive. Pre-processing the logs with **PipelineDigest** yields significant efficiency gains:
 * **Token Reduction:** Stripping ANSI codes and filtering out verbose installation logs reduces raw text payload sizes by **65% to 80%**.
 * **Air-gapped Security:** Downstream AI agents read from local Markdown files rather than requiring live, write-access ADO credentials.
## 3. Cost-Benefit Analysis (ROI)
### Assumptions
 * **QE Team Size:** 5 Quality Engineers.
 * **Average Blended QE Rate:** £50 / hour.
 * **Time Saved:** 1.5 hours per QE, per day.
### Financial Projections
 * **Daily Savings:** 5 QEs × 1.5 hours = 7.5 hours saved per day (£375/day).
 * **Weekly Savings:** 37.5 hours saved per week (£1,875/week).
 * **Annual Savings (48 working weeks):** 1,800 hours saved per year (**£90,000/year** in reclaimed engineering capacity).
 * **AI API Cost Savings:** Estimated reduction of £200–£400/month in LLM token usage due to optimised log payloads.
## 4. Implementation Estimates (1 FTE + GitHub Copilot)
By leveraging a single Full-Time Equivalent (FTE) engineer equipped with a **GitHub Copilot licence**, we can significantly compress the development lifecycle. Copilot accelerates boilerplate generation (such as API integration models and stream parsers) and automates unit test creation.
### Estimated Effort: 5 Business Days (1 Week)
```
[Day 1: Setup & Config] ──> [Day 2: ADO Integration] ──> [Day 3: Sanitisation] ──> [Day 4: AI Formatting] ──> [Day 5: Testing & CI/CD]
```
#### Day 1: Architecture, Configuration, & Setup
 * Establish the TypeScript project structure with strict type-checking (strict: true in tsconfig.json).
 * Define and implement the JSON configuration schema (config.json) to map the 4 repositories, pipeline definition IDs, and target branches.
 * **Copilot Advantage:** Instant generation of TypeScript interfaces and JSON validation schemas.
#### Day 2: Azure DevOps API Integration
 * Implement the core authentication layer using Personal Access Tokens (PAT).
 * Integrate azure-devops-node-api to query build history, filter strictly by BuildReason.Schedule, and isolate the latest run.
 * **Copilot Advantage:** Rapid generation of complex, typed ADO SDK calls and error-handling wrappers.
#### Day 3: Log Extraction & Sanitisation
 * Retrieve raw text logs from individual task IDs sequentially.
 * Build the stream reader utility and write the regex utility to strip terminal ANSI colour codes.
 * **Copilot Advantage:** Automated synthesis of the regex patterns needed to accurately scrub binary escape sequences.
#### Day 4: Semantic Markdown & AI Highlight Generation
 * Implement YAML front matter writer to capture runtime metadata.
 * Create the text pre-scanner tool to isolate high-priority error traces (e.g., exceptions, stack traces, linter exit codes).
 * **Copilot Advantage:** Fast creation of algorithmic text search filters and structured file-writing helper methods.
#### Day 5: Local Testing, CI/CD Setup, & Documentation
 * Set up a GitHub Action or local automated schedule (cron job) to trigger the utility daily.
 * Conduct validation testing to ensure the generated Markdown files compile perfectly.
 * Document runtime setup instructions in a README.
## 5. Risk Assessment & Mitigation

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **API Rate Limits** | Medium | The utility only queries ADO once per day (or on demand) and processes a single run per pipeline, minimising API call volume. |
| **ADO Schema Changes** | Low | We use the official, strictly typed Microsoft client library, preventing silent failures during platform updates. |
| **Flaky Log Parsing** | Low | Instead of attempting to parse every log variation, the tool acts as a simple text scraper that wraps raw text safely in standard markdown code fences. |

## 6. Recommendation
The upfront cost to build **PipelineDigest** is incredibly low—requiring only **one developer-week** of effort using GitHub Copilot. In return, the utility delivers a projected annual capacity savings of **£90,000**, drastically lowers LLM token overheads, and provides the essential foundation needed to transition our QA operations toward automated, AI-driven daily analysis.
We recommend immediate approval to start development.