/**
 * Google Identity Services (GIS) & OAuth 2.0 Integration Helper
 * 
 * Provides official Google Sign-In with real browser account chooser (accounts.google.com),
 * credential parsing (JWT decoding), and local Client ID configuration.
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (notification?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          cancel: () => void;
        };
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: (overrideConfig?: any) => void;
          };
        };
      };
    };
  }
}

const STORAGE_KEY_CLIENT_ID = 'chronicle_google_client_id';

export interface GoogleUserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export const googleAuth = {
  /**
   * Get the active Google Client ID from env or localStorage
   */
  getClientId(): string {
    const fromEnv = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (fromEnv && typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
      return fromEnv.trim();
    }
    return localStorage.getItem(STORAGE_KEY_CLIENT_ID) || '';
  },

  /**
   * Save a user-provided Google Client ID
   */
  setClientId(clientId: string): void {
    if (!clientId) {
      localStorage.removeItem(STORAGE_KEY_CLIENT_ID);
    } else {
      localStorage.setItem(STORAGE_KEY_CLIENT_ID, clientId.trim());
    }
  },

  /**
   * Check if Google Client ID is configured
   */
  isConfigured(): boolean {
    const id = this.getClientId();
    return Boolean(id && id.includes('.apps.googleusercontent.com'));
  },

  /**
   * Parse a Google JWT ID token payload
   */
  parseJwtCredential(token: string): GoogleUserProfile | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const parsed = JSON.parse(jsonPayload);
      return {
        id: parsed.sub,
        name: parsed.name || parsed.given_name || parsed.email.split('@')[0],
        email: parsed.email,
        avatar: parsed.picture || `https://lh3.googleusercontent.com/a/default-user=s96-c`,
      };
    } catch (err) {
      console.error('Failed to parse Google JWT credential:', err);
      return null;
    }
  },

  /**
   * Trigger real Google Sign-In popup using Google OAuth2 Token Client
   */
  signInWithGooglePopup(): Promise<GoogleUserProfile> {
    return new Promise((resolve, reject) => {
      const clientId = this.getClientId();
      if (!clientId) {
        reject(new Error('Google Client ID is not configured.'));
        return;
      }

      if (!window.google?.accounts?.oauth2) {
        reject(new Error('Google Identity Services SDK is not loaded yet.'));
        return;
      }

      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              reject(new Error(tokenResponse.error_description || tokenResponse.error));
              return;
            }

            try {
              // Fetch profile information using access token
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`,
                },
              });

              if (!userInfoRes.ok) {
                throw new Error('Failed to fetch user profile from Google.');
              }

              const info = await userInfoRes.json();
              resolve({
                id: info.sub,
                name: info.name || info.given_name || info.email.split('@')[0],
                email: info.email,
                avatar: info.picture || `https://lh3.googleusercontent.com/a/default-user=s96-c`,
              });
            } catch (err: any) {
              reject(err);
            }
          },
        });

        // Trigger Google OAuth popup window
        client.requestAccessToken();
      } catch (err: any) {
        reject(err);
      }
    });
  },
};
