# Write Together

Write a book with someone else, one turn at a time. You start a book, invite a partner,
family member or friend, and then take turns adding a few sentences whenever you have a
moment. The other writer gets a notification when it is their turn. All your books stand
on a digital bookshelf, where you pick one to continue or to read.

## Stack

| Part      | Technology                                             |
|-----------|--------------------------------------------------------|
| Backend   | Java 21, Spring Boot 3.5, Spring Security (JWT), JPA   |
| Database  | PostgreSQL                                             |
| Frontend  | React 19, TypeScript, Vite, installable as a PWA       |
| Push      | Web Push (VAPID) through a service worker              |

## Run it locally

You need Java 21, Node.js 22 or newer, and Docker (or your own PostgreSQL).

```bash
# 1. database
docker compose up -d

# 2. backend, on http://localhost:8080
cd backend
mvn spring-boot:run

# 3. frontend, on http://localhost:5173
cd frontend
npm install
npm run dev
```

Using your own PostgreSQL instead of Docker? Create a database and a user called
`writetogether` (password `writetogether`), or set `DB_URL`, `DB_USERNAME` and `DB_PASSWORD`.

To try it out you need two accounts: open the app in a normal window and in a private
window, start a book in one and open the invitation link in the other.

### Notifications

Push notifications are optional. Without keys the app works, it just does not notify.

```bash
npx web-push generate-vapid-keys
```

Start the backend with the two keys as `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`, and set
`VAPID_SUBJECT` to `mailto:` plus your e-mail address. Then click "Meldingen aanzetten" in the app.
On an iPhone this only works after adding the app to the home screen.

### Tests

```bash
cd backend
mvn test
```

## How it works

**Data model.** `User` and `Book` are linked through `BookMember` (with a role: owner or
writer). A book has many `Entry` rows, one per piece that was written, each with its author
and position. `Invitation` holds the code behind an invitation link and `PushSubscription`
one browser that wants notifications. The bookshelf has no table of its own: it is every
book you are a member of.

**Taking turns.** `Book.currentTurn` points to the user who may write next.
`BookService.writeEntry` checks the turn, stores the piece and passes the turn to the other
writer in a single transaction, so a book can never end up half updated. The check lives in
the backend: the frontend hides the form when it is not your turn, but only the server can
guarantee it. Whoever starts a book writes the opening and then waits until someone accepts
the invitation.

**Two writers for now.** Version 1 allows two writers per book (`BookService.MAX_WRITERS`).
Because membership is its own table, allowing groups later does not need a database change.

**Logging in.** Passwords are stored as BCrypt hashes. After logging in the frontend gets a
JWT and sends it along with every request; `JwtAuthFilter` turns it back into a user.

## Project layout

```
backend/src/main/java/be/serkan/writetogether
  domain/       entities
  repository/   Spring Data repositories
  service/      the rules: turns, invitations, notifications
  security/     JWT and Spring Security configuration
  web/          REST controllers and DTOs
frontend/src
  api/          fetch wrapper and types
  auth/         login state
  components/   book cover, write form, invite box, ...
  pages/        bookshelf, book, invitation, login
frontend/public
  sw.js         service worker that shows the notifications
```

## Ideas for later

- More than two writers per book
- Reading books that friends have finished
- Exporting a finished book as PDF
- Choosing a cover image
