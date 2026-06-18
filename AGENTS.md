# AGENTS.md

## Cursor Cloud specific instructions

This repository (`github/gitignore`) is a **curated data collection of `.gitignore`
templates**, not a runnable application. Keep the following in mind:

- **No build / install / dependency step.** There is no package manager, lockfile,
  or dependency manifest. The only tool required is `git` (already present on the VM).
  The startup update script is intentionally a near no-op.
- **No application server or test framework.** There is nothing to `dev`/`serve`/`build`.
  Do not attempt to start a server.
- **Structure:** root holds "evergreen" templates for popular technologies; `Global/`
  holds editor/OS/tool templates; `community/` holds specialized and versioned templates.
  See `README.md` for the curation rules and `CONTRIBUTING.md` for contribution rules
  (notably: only modify one template per PR; no duplicate rules).
- **Some templates are symlinks** (e.g. `Clojure.gitignore -> Leiningen.gitignore`,
  `Fortran.gitignore -> C++.gitignore`, `Global/Octave.gitignore -> MATLAB.gitignore`).
  Edit the symlink target, not the link, and avoid breaking these links.
- **The only CI is `.github/workflows/stale.yml`** (a scheduled stale-PR bot that runs on
  GitHub Actions). It is not runnable locally and is unrelated to template content.

### How to "test" a template change

Validate a template by exercising real `git` ignore behavior in a throwaway repo:

```sh
WORK=$(mktemp -d); cd "$WORK"; git init -q
cp /workspace/Node.gitignore .gitignore        # the template under test
mkdir -p node_modules; echo x > node_modules/a.js; echo y > index.js
git check-ignore -v node_modules/a.js          # -> matched (ignored)
git check-ignore -v index.js || echo "index.js NOT ignored (correct)"
```

`git check-ignore -v <path>` prints the matching rule, making it the fastest way to
confirm a template ignores (or does not ignore) a given path.
