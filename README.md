# 💰 Finance Control App

A modern **personal finance manager** built with **Nuxt 3** (frontend) and **.NET 8 API** (backend).
Track income, expenses, installments, and categories in a clean, responsive interface.

---

## ✨ Features

* ✅ Register **income** and **expenses**
* ✅ Support for **installment payments**
* ✅ Categorize transactions (Food, Transport, Education, etc.)
* ✅ Transaction history with filters
* ✅ Responsive UI with **Material Design (Vuetify)**

---

## 🧱 Tech Stack

**Frontend**

* [Nuxt 3](https://nuxt.com/) – Vue framework
* [Vuetify](https://vuetifyjs.com/) – Material Design components
* [Pinia](https://pinia.vuejs.org/) – State management
* [Vite](https://vitejs.dev/) – Build tool
* [TypeScript](https://www.typescriptlang.org/) – Static typing

**Backend**

* [.NET 8](https://dotnet.microsoft.com/) – Web API
* [C#](https://learn.microsoft.com/en-us/dotnet/csharp/) – Backend language

---

## ⚙️ Installation & Usage

```bash
# Clone the repository
git clone https://github.com/your-username/finance-control-app.git
cd finance-control-app/financial-control-web

# Install frontend dependencies
npm install
```

### ▶ Run only the frontend

```bash
npm run dev:front
```

### ▶ Run only the backend

```bash
npm run dev:api
```

### ▶ Run both together

```bash
npm run dev
```

Frontend → [http://localhost:3000](http://localhost:3000)
Backend → [http://localhost:5000](http://localhost:5000) (default, configurable in API)

---

## 🧾 Example

**Scenario:** You paid **\$500** for an online course in **5 installments** under *Education*.

Steps:

1. Add a new expense: `$500`
2. Select category: `Education`
3. Set installments: `5`

**Result:** Expense split into 5 monthly entries of `$100` each, tracked in your overview.

---

## 🗓️ Roadmap

* 📊 Dashboard with charts & insights
* 📤 Export data (Excel/CSV)
* ⏰ Installment due date reminders
* 🔐 User authentication
* ☁️ Cloud sync

---

## 🤝 Contributing

Contributions are welcome!

* Open an issue
* Submit a pull request
* Share feedback

---

## 📄 License

Licensed under the **MIT License**.
Use, modify, and share freely.
