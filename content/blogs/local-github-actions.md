---
title: Debug Pipelines Locally - The Complete Guide to Running GitHub Actions with Act
author: gideon-yebei
categories:
  - devops
  - automation
coverImage:
  src: /blogs/posts/local-github-actions/cover.png
  alt: Visual showing a terminal executing a GitHub Actions workflow pipeline entirely on a local machine using Act
  caption: Stop making dummy commits. Test and debug your cloud pipelines completely offline.
date: 2026-06-26
description: Learn how to use Act to run, test, and step-debug your GitHub Actions workflows locally, saving time and keeping your commit history clean.
draft: false
featured: true
gallery:
  - src: /blogs/posts/local-github-actions/act-running.png
    alt: Terminal interface splitting workflow jobs into localized Docker execution steps
    caption: Act visualizes and executes your YAML workflow steps as local containers.
  - src: /blogs/posts/local-github-actions/secret-injection.png
    alt: Console view demonstrating safe injection of mock API variables and environment variables
    caption: Mock secrets and environment variables safely without exposing production keys.
published: true
publishedAt: 2026-06-26
seo:
  title: How to Test GitHub Actions Locally using Act (2026 Guide)
  description: Deep-dive tutorial into configuring Act for offline GitHub Actions testing. Master Docker runners, event simulation, custom variables, and secret mocking.
  keywords:
    - GitHub Actions
    - Act
    - CI/CD
    - DevOps
    - Docker
    - Local Testing
  canonicalUrl: /blogs/local-github-actions
slug: local-github-actions
tags:
  - github-actions
  - devops
  - docker
updatedAt: 2026-06-26
---

We have all been trapped in the infamous **CI/CD commit loop**. You make a change to a `.github/workflows/ci.yml` file, commit it, push it, wait five minutes for a cloud runner to spin up, and realize you missed a minor indentation or a basic syntax flag.

Ten commits later, your Git history is littered with messages like `"fix ci"`, `"fix ci again"`, and `"please work"`.

It doesn’t have to be this way. By utilizing **Act**, an open-source tool that reads your GitHub Actions files and spins them up inside local Docker containers, you can run, test, and debug your entire automation pipeline locally in seconds.

---

## Step 1: Core Prerequisites and Architecture

Under the hood, `act` uses your local container engine to mimic the hosted virtual environments provided by GitHub (like `ubuntu-latest`).

Before starting, ensure you have the following installed and running:

1. **Docker Desktop** (or Podman / Docker Engine via WSL2).
2. **Your Terminal Shell** (Bash, Zsh, or PowerShell).

### Installing Act

Install the binary framework via your system package manager:

```bash
# macOS (Homebrew)
brew install nektos/tap/act

# Windows (Winget or Scoop)
winget install nektos.act
# OR: scoop install act

# Linux (Bash script installation)
curl --proto '=https' --tlsv1.2 -sSf https://githubusercontent.com | sudo sh
```

Verify your installation works by checking the core version output:

```bash
act --version
```

---

## Step 2: The Initial Sandbox Setup

The first time you execute `act` inside a repository, it will ask you to select a default Docker image size to represent the `ubuntu-latest` runner.

Run a basic list command to trigger this configuration menu:

```bash
act -l
```

### Choosing the Right Runner Size:

- **Micro (Default):** ~200MB image. Fast to download but contains almost no tools. You will manually have to install basics like `curl`, `git`, or languages inside your steps.
- **Medium:** ~500MB+ image. Contains common build tools, Node.js, Python, and Docker dependencies. **(Highly Recommended for most devs)**.
- **Large:** ~18GB+ image. A near-exact match of the actual GitHub cloud environment. Massive download, but highly accurate.

_Note: If you want to change your mind later, you can modify these choices inside your global config file at `~/.actrc`._

---

## Step 3: Executing Your Local Pipeline

Imagine you have a standard test workflow saved inside `.github/workflows/test.yml` that triggers on a code push event:

```yaml
name: Core Test Suite
on: [push]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install and Run Tests
        run: |
          npm ci
          npm test
```

To run this workflow completely offline from the root of your project directory, simply run:

```bash
act push
```

`act` will intercept the `push` event string, match it to the workflow file, compile your code directories directly into a Docker container workspace volumes matrix, and stream the console outputs in real-time.

---

## Step 4: Advanced Scenarios — Events, Secrets, and Artifacts

Real pipelines are rarely as simple as a basic push. They rely on webhooks, secure deployment keys, and matrix configurations. Here is how to manage complex environments locally.

### Simulating Specific Webhook Events

If your workflow triggers on a complex event like a `pull_request` or an `issue_comment`, you can pass mock JSON payloads to test targeted behaviors.

Create a file named `mock-event.json`:

```json
{
  "pull_request": {
    "head": { "ref": "feature-branch" },
    "base": { "ref": "main" }
  }
}
```

Trigger your workflow by passing the event type and payload path flags:

```bash
act pull_request -e mock-event.json
```

### Safely Injecting Secrets and Variables

Never hardcode production API tokens or environment configs into your files. `act` allows you to load mock credentials locally using `.env` syntax files.

Create a file named `.secrets` (and add it to your `.gitignore` immediately!):

```env
AWS_ACCESS_KEY_ID=MOCK_LOCAL_KEY_12345
DEPLOY_TOKEN=ghp_MockSecretTokenStringHere
```

Inject these variables directly into your execution context using the secure secret loader flag:

```bash
act --secret-file .secrets
```

### Isolating Individual Jobs

If your workflow file contains multiple long-running jobs (e.g., `lint`, `test`, `deploy`) and you only want to focus on fixing a specific piece, use the targeted job parameter flag:

```bash
act -j build-and-test
```

---

## Step 5: Common Gotchas and Limitations

While `act` is incredibly powerful, it is a simulation wrapper, not an identical duplicate of the GitHub cloud architecture. Keep these structural limitations in mind:

- **Windows/macOS Runners:** `act` runs natively inside Linux Docker environments. If your workflow declares `runs-on: windows-latest` or `runs-on: macos-latest`, `act` will attempt to run them inside Linux wrappers, which will fail if you rely on native binaries like MSBuild or Xcode.
- **The Checkout Action Caveat:** The native `actions/checkout@v4` action usually fetches historical branches. When executed via `act`, it copies your live local tracking directory as-is. Make sure your local folder doesn't contain giant compiled file structures that will slow down your container mounting states! Use a `.actignore` file to omit massive binary data.

## Wrapping Up

Adding `act` to your localized DevOps toolchain fundamentally changes how you develop automation infrastructure. It shortens your loop testing times from minutes to fractions of a second, protects your repository's commit history from pollution, and ensures that when your pipeline finally makes it to the cloud, it works flawlessly on the very first try.
