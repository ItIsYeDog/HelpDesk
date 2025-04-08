# Helpdesk System

Et support-system bygget med Node.js, Express og MongoDB som lar brukere opprette og administrere support-henvendelser.

## Funksjonaliteter

- Brukerautentisering (innlogging/registrering)
- Ticket håndtering
- Real-time chat
- Admin dashboard
- Ticket historikk
- Prioritetshåndtering
- Statushåndtering
- Responsivt design

## Teknologi Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB med Mongoose
- **Frontend**: EJS, Tailwind CSS
- **Real-time**: Socket.IO
- **Autentisering**: JWT (JSON Web Tokens)

## Installasjon

1. Klon repository
```bash
git clone <repository-url>
cd helpdesk-prosjekt
```

2. Installer avhengigheter
```bash
npm install
```

3. Sett opp miljøvariabler
```bash
cp .env.example .env
```

4. Start serveren
```bash
npm run dev
```

## Miljøvariabler

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/helpdesk
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

## API Ruter

### Autentisering
- `POST /auth/register` - Registrer ny bruker
- `POST /auth/login` - Logg inn
- `GET /auth/logout` - Logg ut

### Tickets
- `GET /tickets/new` - Vis skjema for ny ticket
- `POST /tickets` - Opprett ny ticket
- `GET /tickets/:id` - Vis ticket detaljer
- `GET /tickets/:id/chat` - Hent ticket chat
- `POST /tickets/:id/messages` - Send melding i ticket
- `GET /tickets/:id/history` - Hent ticket historikk

### Admin Routes
- `PATCH /tickets/:id/status` - Oppdater ticket status
- `PATCH /tickets/:id/priority` - Oppdater ticket prioritet

### Dashboard
- `GET /dashboard/user` - Bruker dashboard
- `GET /dashboard/admin` - Admin dashboard

## Modeller

### User
```javascript
{
  username: String,
  password: String,
  role: String ['user', 'admin']
}
```

### Ticket
```javascript
{
  title: String,
  description: String,
  status: String ['Åpen', 'Under arbeid', 'Løst'],
  priority: String ['Lav', 'Medium', 'Høy'],
  category: String,
  createdBy: User reference
}
```

### Message
```javascript
{
  ticketId: Ticket reference,
  sender: User reference,
  content: String
}
```

### TicketHistory
```javascript
{
  ticketId: Ticket reference,
  updatedBy: User reference,
  changeType: String ['status', 'priority', 'comment'],
  oldValue: String,
  newValue: String
}
```

## Sikkerhet

- Rate limiting på API endepunkter
- JWT autentisering
- Middleware for rollebasert tilgangskontroll
- Input validering
- XSS beskyttelse
- CSRF beskyttelse

## Scripts

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "build:css": "tailwindcss -i ./src/styles.css -o ./public/css/output.css --watch"
}
```

## Bidrag

1. Fork repository
2. Opprett feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit endringer (`git commit -m 'Add some AmazingFeature'`)
4. Push til branch (`git push origin feature/AmazingFeature`)
5. Åpne en Pull Request

## Lisens

Dette prosjektet er lisensiert under MIT License - se [LICENSE](LICENSE) filen for detaljer.