Generate new CCA-F exam questions and append them to `data/question_bank.json`.

Usage: `/generate-questions [topic] [difficulty] [count]`

Arguments (all optional):
- `topic` — one of the six CCA-F domains (e.g. "Prompt Engineering", "Tool Use")
- `difficulty` — easy | medium | hard
- `count` — number of questions to generate (default: 5)

Steps:
1. Read the current `data/question_bank.json` to understand existing question IDs and avoid duplicates.
2. Call `POST /api/quiz/generate` with the provided filters and `count`.
3. Pretty-print the returned questions to the terminal so the user can review them.
4. Ask the user: "Append these $count questions to question_bank.json? (y/n)"
5. If yes, read the current file, merge the new questions, write back with `jq`-formatted JSON.
6. Report how many questions are now in the bank.
