# AGENTS.md

## Cursor Cloud specific instructions

### What this repository is
This is [`github/gitignore`](https://github.com/github/gitignore): a curated
**collection of `.gitignore` template files**, not a runnable application. The
deliverable is the templates themselves (`*.gitignore` in the root,
[`Global/`](./Global), and [`community/`](./community)). Everything that isn't a
template is docs/meta: `README.md`, `CONTRIBUTING.md`, `LICENSE`, and
`.github/` (`CODEOWNERS`, `PULL_REQUEST_TEMPLATE.md`, `workflows/stale.yml`).

### Build / install / dependencies
There is **nothing to install or build**. No package manager, no lockfile, no
toolchain. The only tool needed is `git`, which is preinstalled. The startup
update script is intentionally a no-op.

### Lint / test / run
There is **no application, no test suite, and no lint config** in this repo. The
only CI is `.github/workflows/stale.yml`, a scheduled GitHub Action that closes
stale PRs and only runs on GitHub's infrastructure (do not run it locally).

To verify a template "works" (this is the closest thing to a test), apply it to
a throwaway git repo and confirm the right paths are ignored:

```bash
demo=$(mktemp -d) && cd "$demo" && git init -q
cp /workspace/Node.gitignore .gitignore
mkdir node_modules && touch node_modules/x.js src/index.js npm-debug.log
git check-ignore -v node_modules/x.js npm-debug.log   # -> prints matching rule
git status --short                                    # ignored files do not appear
```

To sanity-check that every template still loads in git without error:

```bash
cd /workspace
while IFS= read -r tpl; do
  git -c core.excludesFile="$PWD/$tpl" check-ignore -q -- probe/path.tmp
  [ $? -le 1 ] || echo "BROKEN: $tpl"   # exit >1 means git rejected the file
done < <(git ls-files '*.gitignore')
```

### Contribution rules to respect (from CONTRIBUTING.md)
- Modify **only one template per pull request**.
- Add rules to the most specific/appropriate template (e.g. OS rules like
  `.DS_Store` belong only in `Global/macOS.gitignore`).
- No duplicate rules or duplicate sections.
