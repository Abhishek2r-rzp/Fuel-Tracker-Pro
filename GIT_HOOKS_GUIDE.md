# Git Hooks Guide

## 🪝 Overview

Git hooks are scripts that run automatically before or after Git commands. This project uses **Husky** to manage Git hooks, ensuring code quality before commits.

---

## 📋 Installed Hooks

### `pre-commit` Hook

**Location:** `.husky/pre-commit`

**When it runs:** Before every `git commit`

**What it does:**
1. Runs `npm run build` to build the project
2. If build succeeds ✅ → Commit proceeds
3. If build fails ❌ → Commit is aborted

**Purpose:** Prevents committing broken code that doesn't compile

---

## 🎯 How It Works

### Successful Commit Flow

```bash
$ git add .
$ git commit -m "Add new feature"

🔍 Running pre-commit hook...
📦 Building project to verify code integrity...

vite v5.4.20 building for production...
✓ 2568 modules transformed.
✓ built in 7.39s

✅ Build successful! Proceeding with commit...

[main abc1234] Add new feature
 2 files changed, 10 insertions(+), 5 deletions(-)
```

### Failed Commit Flow

```bash
$ git add .
$ git commit -m "Add broken feature"

🔍 Running pre-commit hook...
📦 Building project to verify code integrity...

vite v5.4.20 building for production...
✗ Build failed with 3 errors:
src/components/Button.jsx:5:10: error: Unexpected token

❌ Build failed! Commit aborted.
🔧 Please fix the build errors before committing.
```

**Result:** Commit is not created, your code stays uncommitted

---

## 🚀 Setup (Already Done)

The Git hooks are already set up in this project. Here's what was done:

### 1. Install Husky

```bash
npm install husky --save-dev
```

### 2. Initialize Husky

```bash
npx husky install
```

### 3. Add Pre-Commit Hook

```bash
npx husky add .husky/pre-commit "npm run build"
```

### 4. Auto-Install Hooks After `npm install`

Added to `package.json`:

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

---

## 💻 Using Git Hooks

### Normal Workflow

Just use Git as usual:

```bash
# 1. Make your changes
vim src/pages/Dashboard.jsx

# 2. Stage files
git add .

# 3. Commit (hook runs automatically)
git commit -m "Update dashboard UI"

# Hook runs:
# - Builds project
# - If successful → commit proceeds
# - If failed → commit aborted
```

### Bypassing Hooks (Not Recommended)

⚠️ **Only use in emergencies!**

```bash
# Skip pre-commit hook
git commit --no-verify -m "Emergency fix"
```

**Warning:** This bypasses all safety checks. Only use if absolutely necessary.

---

## 🔧 Customizing Hooks

### Add More Checks

Edit `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Run linting
echo "🧹 Linting code..."
npm run lint

if [ $? -ne 0 ]; then
  echo "❌ Linting failed!"
  exit 1
fi

# Run build
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo "✅ All checks passed!"
exit 0
```

### Add Other Hooks

```bash
# Pre-push hook (runs before git push)
npx husky add .husky/pre-push "npm test"

# Commit-msg hook (validates commit messages)
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

---

## 📊 Hook Performance

### Build Times

| Project Size | Build Time | Impact |
|--------------|------------|--------|
| Small (<100 files) | ~3-5 seconds | Minimal |
| Medium (100-500 files) | ~5-10 seconds | Acceptable |
| Large (>500 files) | ~10-30 seconds | Consider alternatives |

**Current project:** ~7-10 seconds (acceptable)

### Optimization Tips

If builds are too slow:

1. **Use faster checks first:**
   ```bash
   npm run lint  # Fast (1-2s)
   npm run build # Slow (7-10s)
   ```

2. **Cache build output:**
   ```bash
   # Only build if source files changed
   git diff --cached --name-only | grep -q 'src/' && npm run build
   ```

3. **Use TypeScript check instead:**
   ```bash
   npm run type-check  # Faster than full build
   ```

---

## 🐛 Troubleshooting

### Hook Not Running

**Problem:** Hook doesn't run when committing

**Solution 1:** Re-initialize Husky
```bash
npx husky install
```

**Solution 2:** Check hook is executable
```bash
chmod +x .husky/pre-commit
```

**Solution 3:** Check Git hooks path
```bash
git config core.hooksPath
# Should output: .husky
```

### Hook Always Fails

**Problem:** Build fails even though code is fine

**Solution 1:** Test build manually
```bash
npm run build
```

**Solution 2:** Check Node/npm versions
```bash
node --version  # Should be >=18.0.0
npm --version   # Should be >=9.0.0
```

**Solution 3:** Clear cache and rebuild
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Hook Too Slow

**Problem:** Hook takes too long, slowing down commits

**Solution 1:** Use lint instead of build
```bash
# Edit .husky/pre-commit
npm run lint  # Instead of npm run build
```

**Solution 2:** Use conditional build
```bash
# Only build if src/ changed
git diff --cached --name-only | grep -q 'src/' && npm run build || exit 0
```

---

## 📁 Project Files

### Files Created

| File | Purpose |
|------|---------|
| `.husky/pre-commit` | Pre-commit hook script |
| `.husky/_/husky.sh` | Husky helper script (auto-generated) |
| `GIT_HOOKS_GUIDE.md` | This documentation |

### Files Modified

| File | Change |
|------|--------|
| `package.json` | Added `husky` to devDependencies |
| `package.json` | Added `prepare` script |

---

## ✅ Benefits

### Code Quality

✅ **Prevents broken builds**
- Never commit code that doesn't compile
- Catch syntax errors before pushing

✅ **Enforces standards**
- Run linters automatically
- Ensure consistent code style

✅ **Saves time**
- Catch errors locally (not in CI/CD)
- Avoid "broken build" notifications

### Team Collaboration

✅ **Consistent workflow**
- Everyone runs same checks
- No "it works on my machine"

✅ **Less code review**
- Basic issues caught automatically
- Reviewers focus on logic, not syntax

---

## 🎯 Best Practices

### DO ✅

- Keep hooks fast (<30 seconds)
- Run only essential checks
- Provide clear error messages
- Document custom hooks

### DON'T ❌

- Don't skip hooks unless emergency
- Don't run slow tests in pre-commit (use pre-push)
- Don't commit `.husky` directory to `.gitignore`
- Don't modify `.husky/_/*` files (auto-generated)

---

## 🔄 New Team Member Setup

When someone clones the repo:

```bash
# 1. Clone repo
git clone <repo-url>
cd bill-reader

# 2. Install dependencies (auto-installs hooks via "prepare" script)
npm install

# 3. Hooks are ready!
git commit -m "test"  # Hook will run automatically
```

**Note:** Husky auto-installs on `npm install` via the `prepare` script.

---

## 📖 Additional Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [Git Hooks Documentation](https://git-scm.com/docs/githooks)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🎉 Summary

✅ **Pre-commit hook installed**
- Runs `npm run build` before every commit
- Prevents committing broken code
- ~7-10 seconds per commit

✅ **Auto-setup for new developers**
- Hooks install on `npm install`
- No manual configuration needed

✅ **Customizable**
- Edit `.husky/pre-commit` to add more checks
- Add more hooks as needed

**Your code is now protected!** 🛡️

