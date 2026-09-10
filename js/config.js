const ShotMarketConfig = {
  isDevelopment: function () {
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    );
  },
  isProduction: function () {
    return !this.isDevelopment();
  },
  supabase: {
    url: "https://xplcaiygifwnxyevvqsr.supabase.co",
    anonKey: "sb_publishable_16S4x_HPLxfsUk1RTgR4Qw_gnvlyqD_",
  },
  getBaseURL: function () {
    if (this.isDevelopment()) {
      return `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
    }
    return "https://shotmarket.com";
  },
  getProductionDomain: function () {
    return "shotmarket.com";
  },

  getGalleryURL: function (albumId, galleryToken) {
    if (!albumId || !galleryToken) {
      console.error("Album ID and gallery token are required");
      return "";
    }
    const baseURL = this.getBaseURL();
    return `${baseURL}/gallery.html?album=${encodeURIComponent(albumId)}&token=${encodeURIComponent(galleryToken)}`;
  },
  getPaymentURL: function (albumId) {
    if (!albumId) {
      console.error("Album ID is required");
      return "";
    }
    const baseURL = this.getBaseURL();
    return `${baseURL}/payment.html?album=${encodeURIComponent(albumId)}`;
  },

  storage: {
    privateBucket: "shotmarket-private",
    publicBucket: "shotmarket-public",
    signedUrlExpirationSeconds: 7200,
  },

  payment: {
    minAmount: 10,
    maxAmount: 10000,
    currencyDefault: "USD",
    supportedCurrencies: ["USD", "EUR", "GBP", "KZT"],
  },

  security: {
    enableRLS: true,
    enableStorageEncryption: true,
    requireAuthForProfile: true,
    requireAuthForAlbums: true,
    anonymousDownloadsAllowed: false,
  },

  features: {
    enableQRGeneration: true,
    enableQRDownload: true,
    enableCustomBranding: false,
    enableMultiplePaymentMethods: true,
    enableAnalytics: true,
  },

  logging: {
    enabled: true,
    logLevel: "info",
    logToConsole: true,
  },
  log: function (message, level = "info", data = null) {
    if (!this.logging.enabled) return;
    const levelMap = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = levelMap[this.logging.logLevel] || 1;
    const messageLevel = levelMap[level] || 1;
    if (messageLevel >= currentLevel && this.logging.logToConsole) {
      const timestamp = new Date().toISOString();
      const prefix = `[ShotMarket ${level.toUpperCase()}] ${timestamp}`;
      if (data) {
        console.log(prefix, message, data);
      } else {
        console.log(prefix, message);
      }
    }
  },

  validateConfig: function () {
    const errors = [];
    if (!this.supabase.url) {
      errors.push("Supabase URL is not configured");
    }
    if (!this.supabase.anonKey) {
      errors.push("Supabase Anon Key is not configured");
    }
    if (errors.length > 0) {
      console.error("Configuration Errors:", errors);
      return false;
    }
    return true;
  },
  getEnvironmentInfo: function () {
    return {
      isDevelopment: this.isDevelopment(),
      isProduction: this.isProduction(),
      baseURL: this.getBaseURL(),
      domain: this.getProductionDomain(),
      hostname: window.location.hostname,
      protocol: window.location.protocol,
    };
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = ShotMarketConfig;
}
document.addEventListener("DOMContentLoaded", function () {
  ShotMarketConfig.validateConfig();
  ShotMarketConfig.log(
    "ShotMarket initialized",
    "info",
    ShotMarketConfig.getEnvironmentInfo(),
  );
});
