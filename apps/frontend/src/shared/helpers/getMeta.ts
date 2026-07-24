export const getBugReportMeta = () => ({
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  screenResolution: `${window.screen.width}x${window.screen.height}`,
  viewportSize: `${window.innerWidth}x${window.innerHeight}`,
  browserLanguage: navigator.language,
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  url: window.location.href,
  appVersion: __APP_VERSION__,
  build: __BUILD__
})
