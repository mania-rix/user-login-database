# Contributing to Demo‑Web Store 🛒🔐

A learning sandbox that mixes secure user auth, image uploads, and a Postgres
item catalogue. PRs that tighten security, improve DX, or add tests are welcome! 🚀

---

## Quick start

```bash
git clone https://github.com/<your‑fork>/demo-web
cd demo-web
npm i
npx playwright install chromium           # only if you add UI tests later
cp .env.example .env                      # fill in DB / Cloudinary / JWT secrets
npm start                                 # http://localhost:8080
```

---

## Issue labels

| Label           | Meaning                                           |
| --------------- | ------------------------------------------------- |
| **help‑wanted** | Easy on‑ramps for new contributors                |
| **bug**         | Confirmed defect that needs a fix                 |
| **enhancement** | Polished UX, new feature, doc improvement         |
| **security**    | Anything exposing user data / creds               |
| **deploy**      | Vercel / Docker / CI pipeline issues              |

---

## Open *help‑wanted* tasks

- **.env secrets loader** – replace hard‑coded strings in `auth‑service.js` & `store‑service.js`.  
- **Password reset flow** – token email + expiry check.  
- **Unit tests** – Jest tests for `registerUser()` and `checkUser()`.  
- **Docker compose** – Postgres + Mongo + app for one‑line spin‑up.  
- **Rate limiting** – brute‑force protection on `/login`.  

_Add your idea via an Issue first if unsure._

---

## Coding guidelines

* **Prettier** + **ESLint** (`npm run lint && npm run format` before commit).  
* Node 18+; use ES2022 syntax (`??`, `?.`, static class fields).  
* Prefer async/await over callbacks; never ignore `.catch()`.  
* One feature / fix per PR; update README / Docs when behaviour changes.

---

## Pull‑request checklist

- [ ] Lint & format pass (`npm run lint`, `npm run format`).  
- [ ] `npm test` passes locally **and** in CI.  
- [ ] No secrets committed; `.env` values are placeholders.  
- [ ] Commits signed‑off (`Signed‑off‑by: Your Name <email>`).  
- [ ] Linked Issue closed via **`Fixes #<n>`** in the PR body.

---

## Code of conduct

Be respectful; review time is volunteer time.  
No credential requests, no unethical scraping advice.

Happy coding! 🎉
