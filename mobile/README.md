# Movie Mobile (Expo)

Expo app ported from `frontend/` with the same core flow:

- Login
- Register
- Home with movie categories and horizontal rows
- Watch player with episode selector

## Run

```bash
npm install
npm start
```

## API configuration

Use environment variable:

```bash
cp .env.example .env
```

Set:

```bash
EXPO_PUBLIC_API_URL=https://backend-one-mu-83.vercel.app
```

Notes:

- Android emulator + local backend: `http://10.0.2.2:3001`
- Real device + local backend: `http://<YOUR_LAN_IP>:3001`
- Real device + production backend: use your public `https://...` URL
