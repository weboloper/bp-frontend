// Facebook SDK TypeScript declarations
interface FacebookAuthResponse {
  accessToken: string;
  expiresIn: number;
  signedRequest: string;
  userID: string;
}

interface FacebookLoginStatusResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse: FacebookAuthResponse | null;
}

interface FacebookLoginResponse {
  authResponse: FacebookAuthResponse | null;
  status: string;
}

interface FacebookSDK {
  init(params: {
    appId: string;
    cookie?: boolean;
    xfbml?: boolean;
    version: string;
  }): void;

  login(
    callback: (response: FacebookLoginResponse) => void,
    options?: { scope: string }
  ): void;

  logout(callback?: () => void): void;

  getLoginStatus(callback: (response: FacebookLoginStatusResponse) => void): void;
}

declare global {
  interface Window {
    FB: FacebookSDK;
    fbAsyncInit: () => void;
  }
}

export {};
