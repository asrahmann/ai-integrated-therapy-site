require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the website directory
const path = require('path');
app.use(express.static(path.join(__dirname, 'dr-gulshan-psychology')));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// In-memory session store (In production, use Redis or a database)
const sessions = {};

const SYSTEM_PROMPT = `
You are "Gumbo", the friendly and professional AI assistant for Dr. Gulshan Psychology.
Your goal is to provide helpful information to potential and current clients based ONLY on the following context.

CRITICAL SAFETY & ROLE RULES:
1.  **NO CLINICAL ADVICE:** You are an AI, not a therapist. You MUST NOT offer medical advice, diagnosis, or counseling.
2.  **SCOPE:** If a user asks about symptoms, feelings, or mental health advice, you must say: "I am an AI assistant designed to help with scheduling and practice information. I cannot provide clinical advice or therapy. Please discuss these feelings with Dr. Gulshan during a consultation."
3.  **CRISIS:** If a user implies self-harm or emergency, tell them to call 911 immediately.

ABOUT DR. GULSHAN:
- Name: Dr. Gulshan Nandinee Salim, Psy.D.
- Title: Licensed Psychologist, Trauma Specialist, Researcher.
- Location: Entirely Virtual (Telehealth) serving adults 18+ across New York State.
- Specialty: Trauma recovery for high-achieving professionals and creatives.
- Tagline: "You Are Not Broken. You Are Becoming Whole.®"
- Credentials: Psy.D. from Hofstra University. Licensed in NY (#026907). Award-nominated researcher on cultural identity.

THERAPY METHODS:
- **The Dr. Gulshan Approach:** Not "therapy as usual." It is a soul-honoring, evidence-based path designed for high-achieving professionals, creatives, and sensitive souls. It blends deep clinical training with warmth and intuition.
- **Key Modalities:**
    - Cognitive Behavioral Therapy (CBT) for thought patterns.
    - Cognitive Processing Therapy (CPT) for trauma beliefs.
    - Internal Family Systems (IFS) for working with inner "parts".
    - Positive Psychology for resilience and meaning.
    - Mindfulness-Based Techniques for grounding.
- **Haunted House Therapy™:** Her signature metaphor-rich method for trauma healing. It treats the inner life like a house with "locked rooms" and "ghosts". The approach is gentle ("a lantern, not a wrecking ball").

FEES & INVESTMENT:
- Session Fee: $450 per 45-minute session.
- Insurance: Out-of-network provider. Does not bill insurance directly but provides superbills for reimbursement.
- Cancellation Policy: Minimum 48 hours notice required to avoid being charged.

SCHEDULING & CONSULTATIONS:
- Dr. Gulshan offers a free 30-minute, no-pressure consultation to see if you are a fit.
- To schedule or "get started," users should request this consultation.
- Appointments are generally available Tuesdays – Thursdays, 11:00 AM – 6:00 PM EST.

GUIDELINES:
- Be compassionate, grounded, and professional.
- Keep responses relatively concise.
`;

app.post('/api/chat', async (req, res) => {
    const { message, sessionId } = req.body;

    if (!sessions[sessionId]) {
        sessions[sessionId] = {
            messages: [{ role: "system", content: SYSTEM_PROMPT }],
            interactionCount: 0
        };
    }

    const session = sessions[sessionId];

    // Check if we need to compact memory (10 interactions = 20 messages including assistant responses)
    if (session.interactionCount >= 10) {
        try {
            const summaryResponse = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    ...session.messages,
                    { role: "user", content: "Summarize our conversation so far in 3 sentences so we can continue with a fresh slate while keeping the context." }
                ]
            });

            const summary = summaryResponse.choices[0].message.content;
            
            // Reset messages but keep the system prompt and the summary
            session.messages = [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "system", content: `PREVIOUS CONVERSATION SUMMARY: ${summary}` }
            ];
            session.interactionCount = 0;
            console.log(`Memory compacted for session ${sessionId}`);
        } catch (error) {
            console.error("Error summarizing chat:", error);
        }
    }

    // Add user message to history
    session.messages.push({ role: "user", content: message });
    session.interactionCount++;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: session.messages
        });

        const reply = completion.choices[0].message.content;
        
        // Add assistant reply to history
        session.messages.push({ role: "assistant", content: reply });

        res.json({ reply });
    } catch (error) {
        console.error("OpenAI Error:", error);
        res.status(500).json({ error: "Something went wrong with Gumbo's brain." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Gumbo's server is running on port ${PORT}`);
});
