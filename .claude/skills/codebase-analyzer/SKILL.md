---
name: codebase-analyzer
description: Generate an interactive codebase analysis page with collapsible tree view, file descriptions, size indicators, and file type breakdown. Use when exploring a repo, understanding project structure, or analyzing large files.
allowed-tools: Bash(python *)
triggers:
  - keywords: ["explore", "understand", "structure", "analyze", "codebase", "project map"]
---

# Codebase Analyzer

Generate a comprehensive interactive HTML analysis of your codebase with file descriptions, collapsible directories, and visual breakdown by file type.

## Features

- **Summary Sidebar**: File count, directory count, total size, file type diversity
- **File Type Breakdown**: Top 8 file types displayed as percentage bars with color coding
- **Collapsible Tree View**: Expand/collapse directories to explore structure
- **File Descriptions**: Hover over files to see their purpose and role
- **Color-Coded Icons**: Different colors for each file type for quick visual identification
- **File Sizes**: See aggregate sizes for directories and individual file sizes
- **Dark Theme**: Modern dark interface optimized for readability

## Usage

Run from your project root:

```bash
python .claude/skills/codebase-analyzer/scripts/visualize.py .
```

This generates `codebase-analysis.html` in the current directory and opens it in your browser.

## What You Can Do

- Click folders to expand/collapse and navigate the structure
- Hover over files and directories to see descriptions
- View file sizes at a glance
- Identify large files and directories
- Understand project composition by file type

## Requirements

- Python 3+ (uses only built-in libraries)
- No external dependencies needed
