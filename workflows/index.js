/* File Name: index.js (Node.js Script)
Purpose: Search for PWA repositories and fork them via GitHub API.
*/

const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function run() {
  try {
    console.log("Searching for PWA repositories...");
    
    // 1. Search for repositories with 'PWA' in the name or description
    const { data: searchResults } = await octokit.rest.search.repos({
      q: "topic:pwa language:javascript",
      sort: "stars",
      order: "desc",
      per_page: 5, // Adjust as needed
    });

    for (const repo of searchResults.items) {
      console.log(`Found: ${repo.full_name}. Attempting to fork...`);
      
      try {
        // 2. Fork the repository
        const [owner, repoName] = repo.full_name.split("/");
        await octokit.rest.repos.createFork({
          owner,
          repo: repoName,
        });
        console.log(`Successfully requested fork for ${repo.full_name}`);
      } catch (forkError) {
        if (forkError.status === 403) {
          console.log(`Already forked or permission denied for ${repo.full_name}`);
        } else {
          console.error(`Error forking ${repo.full_name}:`, forkError.message);
        }
      }
    }
  } catch (error) {
    console.error("Search failed:", error.message);
    process.exit(1);
  }
}

run();

/* File Name: main.yml (GitHub Action)
Path: .github/workflows/main.yml
Purpose: Automate the execution of the PWA crawler script.
*/

/*
on:
  push:
  workflow_dispatch:
  schedule:
    - cron: "0 * * * *"

jobs:
  run-bot:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: |
          npm init -y
          npm install @octokit/rest

      - name: Run PWA crawler
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: node index.js
*/
