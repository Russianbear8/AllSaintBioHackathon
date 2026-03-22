import { execSync } from "child_process";
import fs from "fs";

// 1. Get current branch name
const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();

// 2. Define protected branches
const protectedBranches = ["main", "uat", "prod"];

// 3. Read commit message
const commitMsgFile = process.argv[2];
const commitMsg = fs.readFileSync(commitMsgFile, "utf8").trim();

// 4. Check if commit starts with "wip:"
const isWip = commitMsg.startsWith("wip");

// 5. Check if on protected branch
if (isWip && protectedBranches.includes(branch)) {
  console.error(`wip commits are NOT allowed on branch '${branch}'.`);
  console.error(`Protected branches: ${protectedBranches.join(", ")}`);
  process.exit(1); // Block commit
}

// Otherwise, allow commit
process.exit(0);
