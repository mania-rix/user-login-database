# Demo‑Web Store 🛒🔐

A full‑stack Node/Express demo that lets users register, log in, upload
product images to Cloudinary, and store catalogue data in Postgres.
Passwords are hashed with **bcryptjs** and login history is tracked.

> **Live demo:** _coming soon_  
> **Tech:** Express · Mongo (auth) · Postgres/Sequelize (store) · Cloudinary

---

## ✨ Features

* **Secure auth** – hashed passwords, login history, client‑sessions cookie.  
* **Item catalogue** – title / body / price / image / published flag.  
* **Image uploads** – streamed directly to Cloudinary.  
* **Handlebars views** – server‑side rendering with helpers.  
* **Ready for Vercel** – `vercel.json` uses the Node runtime.  

---

## Requirements

| Tool / Lib | Minimum version | Notes                          |
| ---------- | --------------- | ------------------------------ |
| **Node.js**| 18 LTS          | ES2022 syntax used             |
| **npm**    | 9 +             | installs listed dependencies   |
| **Postgres** | 14 +          | or free Render DB             |
| **MongoDB**  | 6 +           | Atlas free tier works          |
| **Cloudinary** | any         | cloud name / key / secret      |

_Note: all runtime deps are already pinned in `package.json`._

---

## 🖥️ Local setup

```bash
git clone https://github.com/<your‑fork>/demo-web
cd demo-web
npm install
cp .env.example .env           # fill DB, Cloudinary, session secret
npm start                      # http://localhost:8080
```
