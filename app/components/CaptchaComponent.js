import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../hooks/useTheme';
import SkeletonLoader from './SkeletonLoader';

const RECAPTCHA_SITE_KEY = process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY || 'your-site-key';

export function CaptchaComponent({ onVerify, onError, action = 'pln_submit' }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const webViewRef = useRef(null);

  const styles = getStyles(colors);

  // Generate reCAPTCHA HTML
  const generateRecaptchaHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>reCAPTCHA</title>
          <script src="https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}"></script>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: ${colors.background};
              color: ${colors.text};
            }
            .container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 200px;
            }
            .loading {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .success {
              color: #10B981;
              font-weight: 600;
            }
            .error {
              color: #EF4444;
              font-weight: 600;
            }
            .retry-button {
              background: ${colors.primary};
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div id="loading" class="loading">
              <div>🔒</div>
              <div>Verifying security...</div>
            </div>
            <div id="success" style="display: none;" class="success">
              ✅ Security verification complete
            </div>
            <div id="error" style="display: none;" class="error">
              ❌ Verification failed
              <button class="retry-button" onclick="executeRecaptcha()">Try Again</button>
            </div>
          </div>

          <script>
            let isExecuting = false;

            function showLoading() {
              document.getElementById('loading').style.display = 'flex';
              document.getElementById('success').style.display = 'none';
              document.getElementById('error').style.display = 'none';
            }

            function showSuccess() {
              document.getElementById('loading').style.display = 'none';
              document.getElementById('success').style.display = 'block';
              document.getElementById('error').style.display = 'none';
            }

            function showError() {
              document.getElementById('loading').style.display = 'none';
              document.getElementById('success').style.display = 'none';
              document.getElementById('error').style.display = 'block';
            }

            function executeRecaptcha() {
              if (isExecuting) return;
              isExecuting = true;
              showLoading();

              grecaptcha.ready(function() {
                grecaptcha.execute('${RECAPTCHA_SITE_KEY}', { action: '${action}' })
                  .then(function(token) {
                    isExecuting = false;
                    showSuccess();
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'CAPTCHA_SUCCESS',
                      token: token
                    }));
                  })
                  .catch(function(error) {
                    isExecuting = false;
                    showError();
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'CAPTCHA_ERROR',
                      error: error.message || 'Verification failed'
                    }));
                  });
              });
            }

            // Auto-execute when page loads
            window.addEventListener('load', function() {
              setTimeout(executeRecaptcha, 1000);
            });
          </script>
        </body>
      </html>
    `;
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'CAPTCHA_SUCCESS':
          setToken(data.token);
          setLoading(false);
          onVerify(data.token);
          break;
          
        case 'CAPTCHA_ERROR':
          setLoading(false);
          onError(data.error);
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Failed to parse WebView message:', error);
      onError('Failed to process security verification');
    }
  };

  const handleLoadEnd = () => {
    // WebView loaded, but still waiting for reCAPTCHA
  };

  const handleError = (error) => {
    console.error('WebView error:', error);
    setLoading(false);
    onError('Failed to load security verification');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Security Verification</Text>
      <Text style={styles.subtitle}>
        Please wait while we verify that you're not a robot
      </Text>
      
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: generateRecaptchaHTML() }}
          onMessage={handleMessage}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scalesPageToFit={true}
          mixedContentMode="compatibility"
        />
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <SkeletonLoader type="circle" width={40} height={40} />
          <Text style={styles.loadingText}>Verifying security...</Text>
        </View>
      )}
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  webViewContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  webView: {
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
});