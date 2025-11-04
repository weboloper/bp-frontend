// Apple Sign In SDK TypeScript declarations

interface AppleAuthorizationResponse {
  code?: string;
  id_token: string;
  state?: string;
}

interface AppleSignInResponse {
  authorization: AppleAuthorizationResponse;
  user?: {
    email?: string;
    name?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

interface AppleAuthInit {
  clientId: string;
  scope: string;
  redirectURI: string;
  state?: string;
  nonce?: string;
  usePopup?: boolean;
}

interface AppleAuth {
  init(config: AppleAuthInit): void;
  signIn(): Promise<AppleSignInResponse>;
}

interface AppleID {
  auth: AppleAuth;
}

declare global {
  interface Window {
    AppleID: AppleID;
  }
}

export {};
