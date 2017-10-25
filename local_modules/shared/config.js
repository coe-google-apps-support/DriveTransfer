/// This file is used to provide configuration options to Drive Transfer's request and task servers.
/// Currently, 4 values are required to be passed in via environment variable:
/// Config.OAuth.CLIENT_ID, Config.OAuth.CLIENT_SECRET, Config.Database.USER and Config.Database.PASSWORD
/// The first 2 can be gotten from the cloud console credentials section.
/// The latter 2 are for authenticating to the MongoDB database.

const Config = {};

Config.ExpoBackoff = {};
Config.ExpoBackoff.MAX_TRIES = 4;
Config.ExpoBackoff.NAPTIME = 2000;

Config.Tasks = {};
Config.Tasks.FIELDS = [
  'id',
  'name',
  'createdTime',
  'mimeType',
  'webViewLink',
  'iconLink',
  'parents',
];

Config.Tasks.Transfer = {};
Config.Tasks.Transfer.EMAIL_MESSAGE = 'drive-transfer-notification-email';

Config.OAuth = {};
Config.OAuth.CLIENT_ID = process.env.DT_CLIENT_ID;
Config.OAuth.CLIENT_SECRET = process.env.DT_CLIENT_SECRET;
Config.OAuth.REDIRECT_URL = process.env.DT_REDIRECT || 'http://localhost:3000/redirect';
Config.OAuth.SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.settings.basic',
];

Config.Web = {};
Config.Web.PORT = process.env.DT_WEB_PORT || 3000;

Config.Database = {};
let db = Config.Database;
Config.Database.NAME = process.env.DT_DATABASE || 'dev';
Config.Database.REPL_NAME = process.env.DT_REPL_SET || 'test';
Config.Database.PORT = process.env.MONGO_PORT_27017_TCP_PORT || 27017;
Config.Database.HOST = process.env.MONGO_PORT_27017_TCP_ADDR  || 'localhost';
Config.Database.USER = process.env.MONGO_INITDB_ROOT_USERNAME;
Config.Database.PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD;
Config.Database.URL = `mongodb://${db.USER}:${db.PASSWORD}@${db.HOST}:${db.PORT}/${db.NAME}?authSource=admin&replicaSet=${db.REPL_NAME}`;
Config.Database.OP_LOG_URL = `mongodb://${db.USER}:${db.PASSWORD}@${db.HOST}:${db.PORT}/local?authSource=admin&replicaSet=${db.REPL_NAME}`;

Config.Session = {};
Config.Session.SECRET = process.env.DT_SESSION_SECRET || 'default-secret';

Config.App = {};
Config.App.EMAIL = 'drivetransfer@edmonton.ca';

if (!Config.OAuth.CLIENT_ID) {
  throw new Error('Please set the DT_CLIENT_ID environment variable.');
}
if (!Config.OAuth.CLIENT_SECRET) {
  throw new Error('Please set the DT_CLIENT_SECRET environment variable.');
}
if (!Config.Database.USER) {
  throw new Error('Please set the MONGO_INITDB_ROOT_USERNAME environment variable.');
}
if (!Config.Database.PASSWORD) {
  throw new Error('Please set the MONGO_INITDB_ROOT_PASSWORD environment variable.');
}

module.exports = Config;
