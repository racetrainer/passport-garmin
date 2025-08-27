# passport-garmin

A Passport OAuth2 strategy implementation for Garmin Connect OAuth2 endpoints.

## Overview

This package implements a Passport OAuth2 authentication strategy specifically configured for Garmin Connect's OAuth2 API. It extends the base `passport-oauth2` strategy with Garmin-specific endpoints and configuration.

## Installation

```bash
npm install @racetrainer/passport-garmin
```

## Usage

### Setting up the strategy

```typescript
import passport from 'passport';
import { Request, Response } from 'express';
import { GarminStrategy, type GarminProfile } from '@racetrainer/passport-garmin';

passport.use(new GarminStrategy({
  clientID: 'your-garmin-client-id',
  clientSecret: 'your-garmin-client-secret',
  callbackURL: 'http://localhost:3000/auth/garmin/callback', // must match the redirect URI in your Garmin developer portal
}, (accessToken: string, refreshToken: string, profile: GarminProfile, done: (error: any, user?: any) => void) => {
  // do any additional processing here, such as saving the user to a database
  return done(null, profile);
}));
```

### Authenticating Users

```typescript
import express, { Request, Response } from 'express';
import session from 'express-session';

const app = express();

// use session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true, sameSite: 'lax' },
}));

// Configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

// initiate authentication to garmin
app.get('/auth/garmin', passport.authenticate('garmin'));

// handle callback from garmin with state stored in session data
app.get('/auth/garmin/callback', 
  passport.authenticate('garmin', { failureRedirect: '/error' }),
  (req: Request & { user: { profile: GarminProfile, accessToken: string, refreshToken: string, expiresAt: number } }, res: Response) => {
    // successful authentication, redirect to dashboard
    res.redirect('/dashboard');
  }
);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

## Documentation

For detailed information about Garmin's OAuth2 implementation, refer to the official documentation:
[Garmin OAuth2 PKCE Documentation](https://developerportal.garmin.com/sites/default/files/OAuth2PKCE_1.pdf)

## License

MIT
