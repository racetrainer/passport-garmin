import {
  InternalOAuthError,
  Strategy as OAuth2Strategy,
} from 'passport-oauth2';

export interface GarminProfile {
  id: string;
  displayName?: string;
  name?: string;
  emails?: Array<{ value: string; type?: string }>;
  photos?: Array<{ value: string }>;
  provider: 'garmin';
  _raw: string;
  _json: any;
}

export class GarminStrategy extends OAuth2Strategy {
  name: string = 'garmin';

  constructor(
    options: {
      clientID: string;
      clientSecret: string;
      callbackURL: string;
      authorizationURL?: string;
      tokenURL?: string;
      scope?: string[];
      scopeSeparator?: string;
    },
    verify: (
      accessToken: string,
      refreshToken: string,
      profile: GarminProfile,
      done: (error: any, user?: any) => void,
    ) => void,
  ) {
    const opts = {
      authorizationURL:
        options.authorizationURL || 'https://connect.garmin.com/oauth2Confirm',
      tokenURL:
        options.tokenURL ||
        'https://connectapi.garmin.com/di-oauth2-service/oauth/token',
      clientID: options.clientID,
      clientSecret: options.clientSecret,
      callbackURL: options.callbackURL,
      state: true,
      pkce: true,
    };

    super(
      opts,
      async (
        accessToken: string,
        refreshToken: string,
        _results: any,
        done: (error: any, user?: any) => void,
      ) => {

          this.userProfile(accessToken, (error, profile: GarminProfile | undefined) => {
            if (error ) {
              done(error);
            } else if (!profile) {
              done(new InternalOAuthError('Failed to retrieve user profile',{}),{});
            } else {  
              verify(accessToken, refreshToken, profile, done);
            }
          });
      },
    );
  }

  async userProfile(accessToken: string, done: (error: any, user?: GarminProfile) => void): Promise<void> {
    try {
      const res = await fetch(
        'https://apis.garmin.com/wellness-api/rest/user/id',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        },
      );
      if (!res.ok) {
        throw new InternalOAuthError(
          `Failed to fetch Garmin user id: ${res.status}`,
          res as any,
        );
      }
      const userData = await res.json();

      // TODO: we could get permissions here and provide that in the callback
      const profile: GarminProfile = {
        id: userData.userId,
        provider: 'garmin',
        _raw: JSON.stringify(userData),
        _json: userData,
      };

      done(null, profile);
    } catch (error) {
      done(new InternalOAuthError(`Failed to retrieve user profile`,error));
    }
  }
}

export { GarminStrategy as Strategy };
