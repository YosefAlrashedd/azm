// Links the project to an Expo account for publishing with EAS Update.
// The link is read from eas.local.json, which is not committed, so the public repo carries no account details.
// eas.local.json looks like: { "owner": "<expo username>", "projectId": "<EAS project id>" }
const fs = require('fs');
const path = require('path');

module.exports = ({ config }) => {
  const file = path.join(__dirname, 'eas.local.json');
  if (!fs.existsSync(file)) return config;
  const { owner, projectId } = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!projectId) return config;
  return {
    ...config,
    ...(owner ? { owner } : {}),
    extra: { ...config.extra, eas: { ...(config.extra && config.extra.eas), projectId } },
    updates: { ...config.updates, url: `https://u.expo.dev/${projectId}` },
  };
};
