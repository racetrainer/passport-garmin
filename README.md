# passport-oauth2-garmin

A Passport OAuth2 strategy implementation for Garmin Connect OAuth2 endpoints.

## Overview

This package implements a Passport OAuth2 authentication strategy specifically configured for Garmin Connect's OAuth2 API. It extends the base `passport-oauth2` strategy with Garmin-specific endpoints and configuration.

## Installation

```bash
npm install @racetrainer/passport-oauth2-garmin
```

## Usage

### Setting up the strategy

```typescript
import passport from 'passport';
import { Request, Response } from 'express';
import { GarminStrategy, type GarminProfile } from '@racetrainer/passport-oauth2-garmin';

passport.use(new GarminStrategy({
  clientID: 'your-garmin-client-id',
  clientSecret: 'your-garmin-client-secret',
  callbackURL: 'http://localhost:3000/auth/garmin/callback', // must match the redirect URI in your Garmin developer portal
}, (accessToken: string, refreshToken: string, profile: GarminProfile, done: (error: any, user?: any) => void) => {
  // Handle user authentication
  return done(null, profile);
}));
```

### Authenticating Users

```typescript
import express, { Request, Response } from 'express';

const app = express();

// Configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

// initiate authentication to garmin
app.get('/auth/garmin', passport.authenticate('garmin'));

// handle callback from garmin with state stored in session data
app.get('/auth/garmin/callback', 
  passport.authenticate('garmin', { failureRedirect: '/login' }),
  (req: Request & { user: { profile: GarminProfile, accessToken: string, refreshToken: string, expiresAt: number } }, res: Response) => {
    // successful authentication, do something with the user data and auth tokens
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
