# /update-ui-guidelines

Automates the following git operations for updating UI guidelines and documentation:

## Steps
1. **Commit changes**
   - Stages and commits `docs/ui-guidelines.md` and `.github/copilot-instructions.md` with a descriptive message.
2. **Push branch**
   - Pushes the current branch to the remote repository.
3. **Create Pull Request**
   - Opens a pull request to merge the current branch into `main` with a summary of changes.
4. **Fetch and Merge Main**
   - Fetches the latest `main` branch and merges it into the current branch after PR is merged.

## Usage
Run the following commands in your terminal:

```bash
# 1. Commit changes
 git add docs/ui-guidelines.md .github/copilot-instructions.md
 git commit -m "Add UI guidelines for TODO app and reference in Copilot instructions"

# 2. Push branch
 git push origin $(git rev-parse --abbrev-ref HEAD)

# 3. Create Pull Request (using GitHub CLI)
 gh pr create --title "Add UI guidelines and update Copilot instructions" --body "- Added docs/ui-guidelines.md with comprehensive glassmorphism UI/UX guidelines for the TODO app.\n- Updated .github/copilot-instructions.md to reference the new UI guidelines document.\n\nReady for review." --base main --head $(git rev-parse --abbrev-ref HEAD)

# 4. Fetch and merge main after PR is merged
 git fetch origin main
 git merge origin/main
```

---

## Notes
- Ensure you have the GitHub CLI (`gh`) installed and authenticated.
- Replace branch names as needed if not using the default workflow.
- This command sequence is designed for Copilot slash command automation and can be adapted for other workflows.
