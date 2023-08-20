const express = require("express");
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require("cors");
var moment = require('moment');
const morganBody = require('morgan-body');

dotenv.config();
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

moment.locale('id');
const app = express();
TZ = 'Asia/Jakarta'
const corsOptions = {
  origin: '*',
  credentials: true,
  // access-control-allow-credentials:true,
  optionSuccessStatus: 200
}
app.use(cors(corsOptions));
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  next();
});
app.options('*', cors());

// middlewares
const morganMiddleware = require("./app/middlewares/morgan.middleware");
const logger = require("./app/utils/logger");
app.locals.logger = logger;

app.use(morganMiddleware);

const db = require("./app/models/index.model");
db.sequelize.sync()

// db.sequelize.sync({ force: true })
// db.sequelize.sync({ logging: console.log })
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });
// db.events.sync(
//   { force: true, logging: console.log }
// )
// db.eventsMessage.sync(
//   { force: true, logging: console.log }
// )
// db.informationFor.sync(
//   { force: true, logging: console.log }
// )
// db.transaction.sync(
//   { force: true, logging: console.log}
// )
// db.masterBank.sync(
//   { force: true, logging: console.log}
// )
// db.masterOccupation.sync(
//   { force: true, logging: console.log}
// )
// db.userProfile.sync(
//   { force: true, logging: console.log}
// )

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const loggerStream = {
  write: message => {
    logger.info(message);
  },
};

morganBody(app, {
  stream: loggerStream,
  prettify: false,
  filterParameters: ['password']
});

require("./app/routes/auth.routes")(app);
require("./app/routes/admin/master_event.routes")(app);
require("./app/routes/admin/master_industry.routes")(app);
require("./app/routes/admin/master_vanue.routes")(app);
require("./app/routes/admin/user.routes")(app);
require("./app/routes/admin/transaction.routes")(app);
require("./app/routes/admin/commission.routes")(app);
require("./app/routes/admin/information.routes")(app);

require("./app/routes/spv/dashboard.routes")(app);
require("./app/routes/spv/user.routes")(app);

require("./app/routes/marketing/myclient.routes")(app);
require("./app/routes/marketing/dashboard.routes")(app);
require("./app/routes/marketing/events.routes")(app);
require("./app/routes/marketing/myprofile.routes")(app);
require("./app/routes/marketing/transaction.routes")(app);
require("./app/routes/marketing/commission.routes")(app);
require("./app/routes/marketing/information.routes")(app);

require("./app/routes/website/wedding.routes")(app);
require("./app/routes/website/marketing.routes")(app);
require("./app/routes/thirdparty/motasi.routes")(app);
require("./app/routes/thirdparty/wapi.routes")(app);

require("./app/routes/scanner/scanner.routes")(app);

app.get("/" + process.env.ENVIRONMENT + "/", (req, res) => {
  res.json({ message: "Welcome to Viseetor " + process.env.ENVIRONMENT });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info("Server " + process.env.ENVIRONMENT + " is running on port " + PORT);
  logger.info(new Date().toString());
});