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
Config.Database.NAME = process.env.DT_DATABASE || 'dev';
Config.Database.PORT = process.env.MONGO_PORT_27017_TCP_PORT || 27017;
Config.Database.HOST = process.env.MONGO_PORT_27017_TCP_ADDR  || 'localhost';
Config.Database.URL = 'mongodb://' + Config.Database.HOST + ':' + Config.Database.PORT + '/' + Config.Database.NAME;
Config.Database.OP_LOG_URL = 'mongodb://' + Config.Database.HOST + ':' + Config.Database.PORT + '/local';

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


module.exports = Config;
