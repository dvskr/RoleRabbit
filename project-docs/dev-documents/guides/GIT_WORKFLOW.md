# Git Workflow

Git branching strategy and workflow for RoleReady development.

## 🌿 Branch Strategy

### Main Branches

- **main** - Production-ready code
- **develop** - Integration branch for features

### Supporting Branches

- **feature/** - New features
- **bugfix/** - Bug fixes
- **hotfix/** - Critical production fixes
- **release/** - Release preparation

## 🔄 Workflow

### Starting a New Feature

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: add feature description"

# Push and create PR
git push origin feature/feature-name
```

### Bug Fixes

```bash
# Create bugfix branch from develop
git checkout -b bugfix/bug-description

# Fix bug and commit
git commit -m "fix: fix bug description"

# Push and create PR
git push origin bugfix/bug-description
```

### Hotfixes

```bash
# Create hotfix from main
git checkout -b hotfix/critical-fix

# Fix and commit
git commit -m "hotfix: critical fix description"

# Merge to main and develop
git checkout main
git merge hotfix/critical-fix
git checkout develop
git merge hotfix/critical-fix
```

## 📝 Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Test changes
- `chore` - Build/tooling changes

### Examples

```
feat(auth): add JWT authentication

Implement JWT-based authentication system with refresh tokens.

Closes #123
```

```
fix(editor): resolve save issue

Fix bug where resume editor was not saving changes properly.

Fixes #456
```

## 🔀 Pull Request Process

1. **Create PR** from feature branch to develop
2. **Add description** with:
   - What changed
   - Why it changed
   - How to test
3. **Request review** from team members
4. **Address feedback** and update PR
5. **Merge** after approval

### PR Checklist

- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] CI checks passing

## 🏷️ Tagging Releases

```bash
# Create release tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## 📋 Best Practices

1. **Keep branches small** - One feature per branch
2. **Commit often** - Small, logical commits
3. **Write clear messages** - Descriptive commit messages
4. **Sync regularly** - Pull latest changes frequently
5. **Review before merge** - Always get code review

## 🚫 What to Avoid

- ❌ Committing directly to main/develop
- ❌ Force pushing to shared branches
- ❌ Large, unrelated commits
- ❌ Commit messages like "fix" or "update"
- ❌ Merging without review

---

**Last Updated:** [Date]

