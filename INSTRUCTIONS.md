# How to Run the Dr. Gulshan Psychology Website & Gumbo Chatbot

This project is a modern, responsive website built with HTML5, CSS3, and a Node.js backend for the AI Chatbot ("Gumbo").

## Prerequisites

1.  **Node.js:** Ensure you have Node.js installed on your computer. You can download it from [nodejs.org](https://nodejs.org/).
2.  **OpenAI API Key:** You will need a valid API key from OpenAI to power the chatbot.

## Setup Instructions

### 1. Configure the Environment
The project uses a `.env` file to store your secrets safely.
1.  Open the file named `.env` in the root folder.
2.  Replace `your_api_key_here` with your actual OpenAI API Key.
    ```env
    OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
    PORT=3000
    ```
3.  Save the file.

### 2. Install Dependencies
Open your terminal (Command Prompt or PowerShell) in this project folder and run:
```bash
npm install
```
This will download the necessary tools (`express`, `openai`, `dotenv`, `cors`) into a `node_modules` folder.

## How to Start the Site

To use the **Chatbot**, you must run the local server. The server acts as the brain for Gumbo.

1.  In your terminal, run:
    ```bash
    node server.js
    ```
2.  You should see the message: `Gumbo's server is running on port 3000`.

## How to View the Website

**Option A: Simple View (No Chatbot)**
- Double-click `dr-gulshan-psychology/index.html`.
- The site will look perfect, but the chat bubble will give an error if you try to send a message because the backend isn't connected.

**Option B: Full Experience (With Chatbot)**
- Ensure `node server.js` is running.
- You can simply open `dr-gulshan-psychology/index.html` in your browser.
- The chat bubble in the bottom right corner will now talk to your local server, which talks to OpenAI!

## Project Structure

- **`server.js`**: The Brain. Handles chat logic, memory management (10-turn cycle), and API security.
- **`dr-gulshan-psychology/`**: The Website.
    - **`css/`**: Styles (Sage Green "Be Well" theme).
    - **`js/`**: Scripts (including `chat.js` which injects the bubble).
    - **`assets/`**: Images (Logos, Dr. Gulshan's photo).
    - **`*.html`**: The 5 main pages (Home, About, Therapy, PTSD, Investment).

## Troubleshooting

- **"Error: The server isn't running"**: This appears in the chat window if you forgot to run `node server.js`.
- **Chat doesn't reply**: Check your terminal for errors. It usually means your API Key in `.env` is invalid or you have run out of OpenAI credits.
