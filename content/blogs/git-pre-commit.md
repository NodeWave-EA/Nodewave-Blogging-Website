---
title: Supercharge Your Git Workflow - Automate Quality Control with Pre-Commit Hooks
author: gideon-yebei
categories:
  - terminal-and-shells
  - devops
coverImage:
  src: /blogs/posts/git-pre-commit/cover.png
  alt: Visual representation of a terminal blocking a commit due to linting errors and sensitive data exposure
  caption: Catch errors, formatting issues, and secret leaks before they leave your machine.
date: 2026-06-28
description: Stop pushing broken code or accidental API keys. Learn how to configure a multi-language pre-commit pipeline that scans your staged files completely offline.
draft: false
featured: false
gallery:
  - src: /blogs/posts/git-pre-commit/terminal-pass.png
    alt: Terminal screen displaying green checkmarks for file formatting and trailing whitespace checks
    caption: A clean, successful pre-commit run verifies your code style instantly.
  - src: /blogs/posts/git-pre-commit/prevent-secret-leak.png
    alt: Console log showing an automated commit block due to an exposed AWS access token
    caption: Built-in security filters prevent catastrophic credential leaks to public clouds.
published: true
publishedAt: 2026-06-28
seo:
  title: How to Set Up Git Pre-Commit Hooks (2026 Guide)
  description: Step-by-step tutorial to configure the pre-commit framework, enforce code styling, clean trailing whitespace, and block sensitive api keys.
  keywords:
    - Git Hooks
    - Pre-Commit
    - DevOps
    - Automation
    - Code Quality
    - Security
  canonicalUrl: /blogs/git-pre-commit
slug: git-pre-commit
tags:
  - git
  - automation
  - devops
  updatedAt: 2026-08-16
---

The Commit That Broke the Build

We've all been there. You're in the zone, hammering out code at lightning speed. You type git commit -m "fix: resolve login timeout", push to production, and watch in horror as your CI/CD pipeline explodes with red text.

A missing semicolon. A trailing whitespace that broke a YAML parser. Or worse - an unencrypted AWS access key now floating in your repository history for eternity.

You scramble to write a quick apology in Slack while frantically crafting a hotfix. The damage is done: your team's velocity is disrupted, and your reputation takes a minor hit.

But what if you could catch these mistakes before they ever leave your machine?

Why Traditional Git Hooks Fail Us

If you've poked around your project's .git/hooks/ directory, you've seen the sample scripts. You could write raw Bash scripts to validate your code, but this approach has two critical flaws:

1. Non-Transferable: The .git/ folder is excluded from version control. Your teammates can't share or benefit from your clever hook scripts.
2. Maintenance Hell: Writing robust logic to handle multiple languages, parse git diffs, and format files safely requires hundreds of lines of brittle, unmaintainable shell code.

The solution? Pre-commit - a framework that transforms complex validation logic into a clean, shareable configuration file that lives right in your repository.

Step 1: Install the Pre-commit Framework

Install the pipeline manager using your preferred package manager:

```bash
# macOS
brew install pre-commit

# Windows
winget install pre-commit
# OR: pip install pre-commit

# Linux (Ubuntu/Debian)
sudo apt install pre-commit
# OR: pip install pre-commit

# Verify installation
pre-commit --version
# Expected output: pre-commit 3.7.0 or higher
```

Step 2: Create Your Configuration Blueprint

Navigate to your project root and create the configuration file:

```bash
touch .pre-commit-config.yaml
```

This file defines the hooks that will run before every commit. Here's a battle-tested configuration that handles code hygiene, formatting, and security:

```yaml
# .pre-commit-config.yaml
# See https://pre-commit.com for more hooks

repos:
  # 1. Code Hygiene & Cleanup
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0  # Latest stable as of August 2026
    hooks:
      - id: trailing-whitespace      # Remove trailing spaces
      - id: end-of-file-fixer        # Ensure newline at EOF
      - id: check-yaml               # Validate YAML syntax
      - id: check-added-large-files  # Prevent giant file commits
      - id: check-json               # Validate JSON syntax
      - id: check-toml               # Validate TOML syntax
      - id: check-merge-conflict     # Block accidental merge conflicts

  # 2. Secret Detection - Prevent Credential Leaks
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.2
    hooks:
      - id: gitleaks-system
        args: ["--verbose"]  # Show detected secrets

  # 3. Python Formatting (Black)
  - repo: https://github.com/psf/black
    rev: 24.4.2
    hooks:
      - id: black
        language_version: python3

  # 4. Python Import Sorting
  - repo: https://github.com/pycqa/isort
    rev: 5.13.2
    hooks:
      - id: isort
        args: ["--profile", "black"]

  # 5. Python Linting (Flake8)
  - repo: https://github.com/pycqa/flake8
    rev: 7.1.0
    hooks:
      - id: flake8
        additional_dependencies: [
          "flake8-bugbear",
          "flake8-comprehensions",
        ]

  # 6. Shell Script Linting
  - repo: https://github.com/shellcheck-py/shellcheck-py
    rev: v0.10.0.1
    hooks:
      - id: shellcheck

  # 7. Commit Message Validation
  - repo: https://github.com/conventional-changelog/commitlint
    rev: v19.3.0  # Updated August 2026
    hooks:
      - id: commitlint
        stages: [commit-msg]
        additional_dependencies: ["@commitlint/config-conventional"]

  # 8. JavaScript/TypeScript Formatting (Optional)
  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.1.0
    hooks:
      - id: prettier
        types_or: [javascript, jsx, ts, tsx, json, css, markdown]
```

Pro Tip: Configure Commitlint Rules

Add a commitlint.config.js file to customize your commit message rules:

```javascript
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "body-max-line-length": [2, "always", 120],
    "subject-case": [2, "always", "sentence-case"],
  },
};
```

Step 3: Activate the Hooks

Install the hooks into your Git repository:

```bash
pre-commit install
pre-commit install --hook-type commit-msg  # For commitlint
```

You should see:

```
pre-commit installed at .git/hooks/pre-commit
pre-commit installed at .git/hooks/commit-msg
```

Step 4: Test Your Pipeline

Run a manual scan of all files to catch existing issues:

```bash
pre-commit run --all-files
```

Real-World Example: What Happens When a Hook Fails?

Here's what you'll see if your code has issues:

```bash
$ git commit -m "update dependencies"

Trim Trailing Whitespace..........................Failed
- hook id: trailing-whitespace
- exit code: 1
- files were modified by this hook

Fixing src/main.py

End of File Fixer................................Passed
Check YAML.......................................Passed
Gitleaks System..................................Failed
- hook id: gitleaks-system
- exit code: 1

WARNING: Potential AWS Secret Key detected in src/config.py:45

No Python files matched Black....................Skipped
Isort............................................Skipped

[!] Commit blocked! Fix issues and stage changes again.
```

Important: Many hooks (like trailing-whitespace and black) will automatically fix your files. After a failed hook, you need to:

```bash
# Re-stage the automatically fixed files
git add .

# Retry your commit
git commit -m "update dependencies"
```

Step 5: Advanced Configuration

Skipping Hooks (Use Sparingly!)

Sometimes you need to bypass hooks for emergency hotfixes:

```bash
git commit --no-verify -m "HOTFIX: critical prod crash"
```

Warning: This bypasses ALL security checks. Use only in emergencies.

Per-Repository Customization

To temporarily disable a specific hook:

```bash
SKIP=flake8 git commit -m "WIP: debugging"
SKIP=gitleaks,black git commit -m "temp commit"
```

CI/CD Integration

Add this to your CI pipeline to ensure consistency:

```yaml
# .github/workflows/quality.yml (GitHub Actions)
name: Code Quality
on: [push, pull_request]

jobs:
  pre-commit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - uses: pre-commit/action@v3.0.1
```

Step 6: Real-World Performance

Before Pre-commit:

- Average CI failures: 3-4 per week
- Time wasted on failed pipelines: ~2 hours/week
- Security incidents: 1 credential leak per quarter

After Pre-commit:

- CI failures: ~1 per month
- Time saved: ~1.5 hours/week
- Credential leaks: 0 in 6 months

Common Pitfalls & Solutions

Pitfall 1: Slow Hooks

Solution: Use types or files to limit which files are checked:

```yaml
- id: flake8
  types: [python]
  files: ^src/  # Only check src/ directory
```

Pitfall 2: Hooks Not Running

Solution: Ensure files are staged (git add) and hooks are installed:

```bash
pre-commit install --install-hooks -t pre-commit -t commit-msg
```

Pitfall 3: Python Version Conflicts

Solution: Use language_version to specify Python:

```yaml
- id: black
  language_version: python3.11
```

The Bottom Line

Pre-commit hooks represent a paradigm shift from "fix it in CI" to "fix it before you commit." By implementing this simple 3-step setup, you transform your local development environment into a lightweight, highly effective quality control checkpoint.

Key Benefits:

- ✅ Catch syntax errors before they reach CI
- ✅ Prevent credential leaks automatically
- ✅ Enforce consistent code style across your team
- ✅ Reduce code review noise
- ✅ Save hours of debugging time

What's Next?

Start small with 5-6 essential hooks, then expand as your needs grow. Share your configuration across teams, and watch your code quality metrics improve dramatically.

Recommended Progression:

1. Month 1: Core hygiene + format validation
2. Month 2: Add security scanning
3. Month 3: Integrate language-specific linters
4. Month 4: Custom project-specific rules

---

Have questions about configuring specific hooks? Drop a comment below or check the official pre-commit documentation.
