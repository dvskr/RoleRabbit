# Workflow Automation - User Guide

Complete guide to building, testing, and executing automated workflows in RoleRabbit.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Building Workflows](#building-workflows)
4. [Node Types](#node-types)
5. [Testing Workflows](#testing-workflows)
6. [Executing Workflows](#executing-workflows)
7. [Templates](#templates)
8. [Advanced Features](#advanced-features)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

## Introduction

The workflow automation system allows you to create powerful, automated job application workflows by connecting different AI-powered nodes together. Think of it as a visual programming interface where each node performs a specific task, and you connect them to create complex automation.

### Key Concepts

- **Workflow**: A collection of connected nodes that perform a series of tasks
- **Node**: An individual task or operation (e.g., analyze job, generate resume)
- **Connection**: A link between nodes that passes data from one node to another
- **Execution**: Running a workflow with specific input data
- **Template**: A pre-built workflow that you can customize for your needs

## Getting Started

### Creating Your First Workflow

1. Navigate to **Workflow Automation** from the main menu
2. Click **New Workflow** button
3. Enter a workflow name (e.g., "Resume Tailoring Workflow")
4. Select a trigger type:
   - **Manual**: You start the workflow manually
   - **Scheduled**: Runs automatically on a schedule
   - **Webhook**: Triggered by external systems

5. Click **Create** to open the workflow builder

### Workflow Builder Interface

The workflow builder consists of three main areas:

**Left Panel - Node Palette**
- Browse available nodes by category
- Drag nodes onto the canvas
- Search for specific node types

**Center - Canvas**
- Visual workflow editor
- Connect nodes by dragging from output to input
- Pan and zoom to navigate large workflows

**Right Panel - Node Configuration** (appears when you select a node)
- Configure node settings
- Set input paths and parameters
- Test individual nodes
- View node documentation

### Toolbar Features

- **Save**: Save workflow changes
- **Export**: Download workflow as JSON
- **Import**: Load workflow from JSON file
- **Undo** (Ctrl+Z): Revert last change
- **Redo** (Ctrl+Y): Restore undone change
- **Run**: Execute the workflow

## Building Workflows

### Adding Nodes

1. **Drag and Drop**: Click and drag a node from the palette to the canvas
2. **Position**: Place the node where you want it in your workflow
3. **Configure**: Click the node to open the configuration panel

### Connecting Nodes

1. Click on a node's output handle (right side)
2. Drag to another node's input handle (left side)
3. Release to create the connection
4. Delete connections by selecting and pressing Delete

### Configuring Nodes

Each node has specific configuration options:

#### Common Configuration

All nodes have these fields:
- **Display Name**: Custom name for this instance
- **Description**: Optional notes about what this node does

#### Path-Based Configuration

Many nodes use "path" fields to reference data:

```
jobDescription          → Use data directly from this field
input.jobDescription    → Use data from workflow input
{{result}}              → Use output from previous node
{{$variableName}}       → Use workflow variable
```

**💡 Tip**: Use autocomplete! Press ↓ or Tab in path fields to see available options.

### Data Flow

Data flows through your workflow from left to right:

```
[Start] → [Node 1] → [Node 2] → [Node 3] → [End]
          output     uses         uses
                     Node 1       Node 2
                     data         data
```

Example workflow:
```
[Manual Trigger]
  ↓
[AI Agent Analyze] → analyzes job posting
  ↓
[Resume Generate] → creates tailored resume using analysis
  ↓
[Cover Letter Generate] → creates cover letter using resume
  ↓
[Complete]
```

## Node Types

### AI Nodes

#### AI Agent Analyze
Analyzes job postings and determines fit.

**Configuration**:
- Job URL Path: Where to find the job URL
- Minimum Score: Threshold for job match (1-10)

**Output**: Match score, analysis, recommendations

#### Resume Generate
Creates tailored resumes for specific jobs.

**Configuration**:
- Job Description Path: Source of job description
- Base Resume ID Path: Starting resume template
- Tone: professional, casual, confident, humble
- Length: short, medium, long

**Output**: Generated resume content

#### Cover Letter Generate
Produces personalized cover letters.

**Configuration**:
- Job Description Path: Job to apply for
- Resume Path: Your resume data
- Company Path: Company name
- Tone: professional, casual, confident, enthusiastic

**Output**: Cover letter content

#### Interview Prep
Generates interview questions and answers.

**Configuration**:
- Job Description Path: Position details
- Company Path: Company name
- Base Resume ID Path: Your background

**Output**: Questions, answers, tips

### Bulk Processing Nodes

#### Bulk Resume Generator
Creates resumes for multiple jobs simultaneously.

**Configuration**:
- Job Descriptions Array Path: Array of jobs
- Base Resume ID Path: Template resume
- Tone: professional, casual, confident, humble
- Length: short, medium, long

**Output**: Array of generated resumes

#### Bulk JD Processor
Processes multiple job descriptions.

**Configuration**:
- Job Descriptions Array Path: Jobs to process
- Action: analyze, generate_resume, full_application
- Base Resume ID Path: Template

**Output**: Processed job data

### Research Nodes

#### Company Research
Gathers information about companies.

**Configuration**:
- Company Name Path: Company to research

**Output**: Company info, culture, recent news

### Communication Nodes

#### Cold Email
Generates personalized outreach emails.

**Configuration**:
- Recipient Email Path: Who to email
- Recipient Name Path: Person's name
- Company Path: Their company
- Tone: professional, casual, confident, friendly
- Email Type: introduction, follow-up, inquiry

**Output**: Email subject and body

### Logic Nodes

#### Filter
Filters data based on conditions.

**Configuration**:
- Condition: Expression to evaluate
- True Path: Where to go if true
- False Path: Where to go if false

#### Delay
Waits for a specified time.

**Configuration**:
- Duration: How long to wait (seconds, minutes, hours)

## Testing Workflows

### Testing Individual Nodes

Before running a full workflow, test individual nodes:

1. Select a node
2. Click **Test Node** button in configuration panel
3. Enter test input in JSON format:
   ```json
   {
     "jobDescription": "Software Engineer position...",
     "company": "Acme Corp"
   }
   ```
4. Click **Test** to run
5. View results:
   - ✅ Success: Shows output and execution time
   - ❌ Error: Shows error message and stack trace

6. Modify input and test again to iterate quickly

**Benefits**:
- Validate configuration before running workflow
- Debug issues faster
- Experiment with different inputs
- See execution time for performance tuning

### Testing Full Workflows

1. Save your workflow
2. Click **Run** button
3. Enter workflow input (if required)
4. Monitor execution in real-time:
   - Nodes highlight as they execute
   - See progress in execution panel
   - View logs and outputs

## Executing Workflows

### Manual Execution

1. Open the workflow
2. Click **Run** button
3. Provide input data (if needed)
4. Monitor progress
5. View results when complete

### Scheduled Execution

1. Open workflow settings
2. Click **Add Schedule**
3. Enter cron expression:
   ```
   0 9 * * 1-5    → Every weekday at 9 AM
   0 */6 * * *    → Every 6 hours
   0 0 * * 0      → Every Sunday at midnight
   ```
4. Set timezone
5. Provide default input
6. Save schedule

### Webhook Execution

1. Open workflow settings
2. Click **Create Webhook**
3. Copy the webhook URL
4. Configure external system to call webhook
5. Send POST request with JSON payload

Example:
```bash
curl -X POST https://app.rolerabbit.com/api/workflows/webhook/abc123 \
  -H "Content-Type: application/json" \
  -d '{"jobUrl": "https://example.com/job/123"}'
```

### Execution History

View past executions:
1. Go to **Executions** tab
2. Filter by:
   - Workflow
   - Status (completed, failed, running)
   - Date range
   - Triggered by (manual, schedule, webhook)

3. Click an execution to view:
   - Input data
   - Output results
   - Execution logs
   - Duration
   - Error details (if failed)

### Canceling Executions

To cancel a running execution:
1. Go to **Executions** tab
2. Find the running execution
3. Click **Cancel** button
4. Confirm cancellation

## Templates

### Using Templates

Templates are pre-built workflows you can customize:

1. Go to **Templates** tab
2. Browse available templates:
   - **Resume Tailoring**: Analyze job and generate resume
   - **Full Application**: Complete application with cover letter
   - **Bulk Apply**: Apply to multiple jobs
   - **Interview Prep**: Prepare for interviews
   - **Company Research**: Research before applying

3. Click **Use Template**
4. Customize the workflow
5. Save with a new name

### Creating Templates

Turn your workflow into a template:

1. Build and test your workflow
2. Open workflow settings
3. Check **Save as Template**
4. Add description and tags
5. Save

## Advanced Features

### Undo/Redo

Never lose work with comprehensive undo/redo:

- **Undo**: Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
- **Redo**: Ctrl+Y or Cmd+Shift+Z
- History saves last 50 changes
- Keyboard shortcuts work everywhere except input fields
- Visual feedback when undo/redo unavailable

### Template Variable Autocomplete

Get suggestions while configuring nodes:

- Press **↓** or **Tab** in any path field
- Use **Arrow keys** to navigate suggestions
- Press **Enter** or **Tab** to select
- Press **Esc** to close suggestions
- Filter by typing

Available suggestions:
- Common paths: `jobDescription`, `company`, `jobTitle`
- Input paths: `input.*`
- Template variables: `{{result}}`, `{{output}}`
- Workflow variables: `{{$variableName}}`

### Variables

Define reusable variables:

1. Open workflow settings
2. Go to **Variables** tab
3. Add variable:
   - Name: `apiKey`
   - Value: `your-api-key`
   - Type: `string`, `number`, `boolean`

4. Use in nodes: `{{$apiKey}}`

### Conditional Logic

Create conditional workflows:

1. Add a **Filter** node
2. Configure condition:
   ```javascript
   score >= 8
   status === "active"
   experience > 2
   ```

3. Connect true/false paths to different nodes
4. Workflow branches based on condition

### Error Handling

Handle errors gracefully:

1. Add **Try-Catch** node
2. Connect nodes inside try block
3. Connect error path to recovery logic
4. Configure retry settings:
   - Max retries: 3
   - Retry delay: 5 seconds
   - Exponential backoff: enabled

## Best Practices

### Workflow Design

1. **Start Simple**: Build small workflows first
2. **Test Early**: Test nodes before connecting
3. **Use Templates**: Start from templates when possible
4. **Name Clearly**: Use descriptive node names
5. **Add Comments**: Document complex logic
6. **Version Control**: Export workflows regularly

### Performance

1. **Batch Operations**: Use bulk nodes for multiple items
2. **Avoid Loops**: Use array processing instead
3. **Set Timeouts**: Prevent infinite executions
4. **Monitor Usage**: Check execution statistics

### Data Management

1. **Minimize Data**: Only pass required fields between nodes
2. **Validate Input**: Check data before processing
3. **Handle Errors**: Always have error paths
4. **Clean Up**: Remove unused variables

### Security

1. **Use Variables**: Store sensitive data in variables, not configuration
2. **Limit Access**: Set appropriate workflow permissions
3. **Audit Logs**: Review execution history regularly
4. **Webhook Security**: Use webhook secrets for authentication

## Troubleshooting

### Common Issues

#### Workflow Won't Execute

**Problem**: Click Run but nothing happens

**Solutions**:
- Check workflow status is ACTIVE
- Verify all nodes are properly connected
- Ensure required input is provided
- Check for validation errors

#### Node Failing

**Problem**: Specific node always fails

**Solutions**:
- Use **Test Node** to debug
- Check configuration paths are correct
- Verify input data format
- Review error message in execution logs
- Check rate limits and quotas

#### Data Not Passing

**Problem**: Node receives empty/null data

**Solutions**:
- Verify path references are correct
- Check previous node completed successfully
- Use autocomplete to find correct paths
- Review execution logs for data

#### Performance Issues

**Problem**: Workflow runs slowly

**Solutions**:
- Use bulk operations for multiple items
- Remove unnecessary nodes
- Optimize database queries
- Check for infinite loops

### Getting Help

- **Documentation**: Read this guide and API reference
- **Examples**: Browse template workflows
- **Logs**: Check execution logs for details
- **Support**: Contact support with workflow ID

### Debug Mode

Enable debug mode for detailed logging:

1. Open workflow settings
2. Enable **Debug Mode**
3. Run workflow
4. View detailed logs in execution history

## Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Save | Ctrl+S | Cmd+S |
| Undo | Ctrl+Z | Cmd+Z |
| Redo | Ctrl+Y | Cmd+Shift+Z |
| Run | Ctrl+Enter | Cmd+Enter |
| Delete Node | Delete | Delete |
| Select All | Ctrl+A | Cmd+A |
| Zoom In | Ctrl++ | Cmd++ |
| Zoom Out | Ctrl+- | Cmd+- |
| Fit View | Ctrl+0 | Cmd+0 |

## Limits and Quotas

- **Max Nodes per Workflow**: 100
- **Max Concurrent Executions**: 5 per workflow
- **Execution Timeout**: 5 minutes (configurable up to 30 minutes)
- **Max Workflow Size**: 10 MB
- **Max History**: 1000 executions per workflow
- **Max Schedules**: 10 per workflow
- **Max Webhooks**: 5 per workflow

## Next Steps

- Explore **Templates** to see example workflows
- Build your first workflow with the **Quick Start Guide**
- Read the **API Reference** for advanced integrations
- Join the community to share workflows and get help
