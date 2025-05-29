# Consist-AI Chat Application

Welcome to **Consist-AI**, an intelligent chatbot application built with **Next.js**, **React**, **ShadCN UI**, **Tailwind CSS**, and powered by **Google's Gemini models** via **Genkit**. It offers a rich, multimodal conversational experience with various input/output methods and AI persona simulations.

## 🚀 Features

- **Conversational AI Chat** – Text-based interaction with AI.
- **Image Input** – Send images with messages for multimodal conversations.
- **Audio Input (Speech-to-Text)** – Dictate your messages.
- **Audio Output (Text-to-Speech)** – Hear the AI's replies.
- **Multiple AI Persona Simulation** – Experience varied AI personalities.
- **Response Ranking** – Ranks multiple AI responses by quality and shows the best one.
- **Real-time Data Access (Disabled)** – Built-in tool available for dynamic data.
- **Responsive UI** – Works on both desktop and mobile.
- **Light/Dark Theme Toggle** – Switch between themes.
- **Clear/New Chat** – Easily start fresh interactions.
- **Homepage** – Friendly landing page.

## 🧱 Tech Stack

### Frontend
- **Next.js (App Router)**
- **React**
- **TypeScript**

### UI
- **ShadCN UI**
- **Tailwind CSS**
- **Lucide React (Icons)**

### AI / Backend Logic
- **Genkit**
- **Google Gemini (via `@genkit-ai/googleai`)**
- **Next.js Server Actions**

### State Management
- **React Context**
- **useState**

## ⚙️ Prerequisites

- **Node.js** (v18 or later recommended)
- **npm** or **yarn**

## 📦 Project Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Sheik-Razak/Consist-AI.git
cd Consist-AI
```
2. Install Dependencies
```bash
npm install
```
If you're in Firebase Studio, dependency installation is handled automatically.

3. Setup Environment Variables
Create a .env file in the project root:

Replace the value with your actual Google API key. //API Key is already provided don't missuse it

🧪 Running the Project
```
You need to run two development servers: one for Genkit, and one for Next.js.
```
Start the Genkit Development Server
```bash
npm run genkit:dev
```
```
Access: http://localhost:4000
```
Start the Next.js Development Server
```bash
npm run dev
```
```
Access: http://localhost:9002
```
Ports Summary
Service	Port
```
Next.js App	http://localhost:9002
Genkit UI	http://localhost:4000
```
📜 NPM Scripts
npm run dev – Run Next.js development server

npm run genkit:dev – Run Genkit development server

npm run genkit:watch – Genkit dev server with watch mode

npm run build – Build the app for production

npm run start – Start production server

npm run lint – Run ESLint

npm run typecheck – Check TypeScript types

🗂️ File Structure Overview
```bash
Copy
Edit
src/
├── app/            # Next.js App Router pages
│   ├── layout.tsx
│   ├── page.tsx
│   └── chat/page.tsx
├── components/     # Reusable UI components
│   ├── chat/
│   ├── layout/
│   └── ui/
├── ai/             # Genkit logic and flows
│   ├── dev.ts
│   ├── genkit.ts
│   ├── flows/
│   └── tools/
├── lib/            # Utilities and types
├── hooks/          # Custom React hooks
public/             # Static files
.env                # Environment variables
package.json        # Scripts and dependencies
```
💡 Recommended VS Code Extensions
ESLint – Linting support

Prettier – Code formatting

Tailwind CSS IntelliSense – Tailwind autocomplete

Path Intellisense – Path autocomplete

DotENV – Syntax highlighting for .env files

For Firebase Studio, these are already set in .vscode/settings.json:

```
{
  "IDX.aI.enableInlineCompletion": true,
  "IDX.aI.enableCodebaseIndexing": true
}
```
👨‍💻 Author
Sheik Razak
🔗 GitHub Repository

