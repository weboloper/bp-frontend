// src/hooks/useSocialAuth.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useSocialAuth(redirectUrl: string = '/dashboard') {
  const router = useRouter();
  const [fbLoading, setFbLoading] = useState(false);
  const [fbError, setFbError] = useState('');
  const [appleLoading, setAppleLoading] = useState(false);
  const [appleError, setAppleError] = useState('');

  // Load Facebook SDK
  useEffect(() => {
    const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    if (!facebookAppId) return;

    window.fbAsyncInit = function () {
      if (window.FB) {
        window.FB.init({
          appId: facebookAppId,
          cookie: true,
          xfbml: true,
          version: 'v18.0',
        });
      }
    };

    // Load the SDK asynchronously
    (function (d, s, id) {
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      const js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs?.parentNode?.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  }, []);

  // Load Apple Sign In SDK
  useEffect(() => {
    const appleClientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
    if (!appleClientId) return;

    const script = document.createElement('script');
    script.src =
      'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      alert('Google Client ID is not configured');
      return;
    }
    const redirectUri = `${window.location.origin}/api/auth/social/google/callback`;
    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=openid email profile&` +
      `access_type=offline&` +
      `prompt=consent`;
    window.location.href = googleAuthUrl;
  };

  const handleFacebookLogin = async () => {
    const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    if (!facebookAppId) {
      setFbError('Facebook App ID is not configured');
      return;
    }

    if (!window.FB) {
      setFbError('Facebook SDK not loaded. Please refresh the page.');
      return;
    }

    setFbLoading(true);
    setFbError('');

    window.FB.login(
      async function (response) {
        if (response.authResponse) {
          const fbAccessToken = response.authResponse.accessToken;

          try {
            // Send Facebook access token to Django backend
            const djangoApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const backendResponse = await fetch(
              `${djangoApiUrl}/api/accounts/auth/social/facebook/`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  access_token: fbAccessToken,
                }),
              }
            );

            const backendData = await backendResponse.json();

            if (!backendResponse.ok) {
              setFbError('Authentication failed');
              setFbLoading(false);
              return;
            }

            // Set tokens via Next.js API route
            const tokenResponse = await fetch('/api/auth/social/facebook/set-tokens', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                access_token: backendData.access_token || backendData.access,
                refresh_token: backendData.refresh_token || backendData.refresh,
              }),
            });

            if (tokenResponse.ok) {
              router.push(redirectUrl);
            } else {
              setFbError('Failed to set authentication tokens');
              setFbLoading(false);
            }
          } catch (error) {
            setFbError('Network error occurred');
            setFbLoading(false);
          }
        } else {
          setFbError('Facebook login was cancelled');
          setFbLoading(false);
        }
      },
      { scope: 'public_profile,email' }
    );
  };

  const handleAppleLogin = async () => {
    const appleClientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
    if (!appleClientId) {
      setAppleError('Apple Client ID is not configured');
      return;
    }

    if (!window.AppleID) {
      setAppleError('Apple Sign In SDK not loaded. Please refresh the page.');
      return;
    }

    try {
      setAppleLoading(true);
      setAppleError('');

      // Initialize Apple Sign In
      window.AppleID.auth.init({
        clientId: appleClientId,
        scope: 'name email',
        redirectURI: window.location.origin,
        usePopup: true,
      });

      const data = await window.AppleID.auth.signIn();

      if (data.authorization && data.authorization.id_token) {
        const identityToken = data.authorization.id_token;

        // Send identity token to Django backend
        const djangoApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const backendResponse = await fetch(
          `${djangoApiUrl}/api/accounts/auth/social/apple/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              identity_token: identityToken,
            }),
          }
        );

        const backendData = await backendResponse.json();

        if (!backendResponse.ok) {
          setAppleError('Authentication failed');
          setAppleLoading(false);
          return;
        }

        // Set tokens via Next.js API route
        const tokenResponse = await fetch('/api/auth/social/facebook/set-tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: backendData.access_token || backendData.access,
            refresh_token: backendData.refresh_token || backendData.refresh,
          }),
        });

        if (tokenResponse.ok) {
          router.push(redirectUrl);
        } else {
          setAppleError('Failed to set authentication tokens');
          setAppleLoading(false);
        }
      } else {
        setAppleError('Failed to get identity token from Apple');
        setAppleLoading(false);
      }
    } catch (error: any) {
      setAppleError(error.message || 'Apple Sign In failed');
      setAppleLoading(false);
    }
  };

  return {
    handleGoogleLogin,
    handleFacebookLogin,
    handleAppleLogin,
    fbLoading,
    fbError,
    appleLoading,
    appleError,
  };
}
