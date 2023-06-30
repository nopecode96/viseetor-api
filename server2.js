const express = require("express");
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require("cors");
var moment = require('moment');

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

const db = require("./app/models/index.model");
db.sequelize.sync()
// db.sequelize.sync({ force: true })
// db.sequelize.sync({ logging: console.log })
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });
db.auditLogAdmin.sync(
  { force: true, logging: console.log }
)
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

require("./app/routes/auth.routes")(app);
require("./app/routes/admin/master_event.routes")(app);
require("./app/routes/admin/master_industry.routes")(app);
require("./app/routes/admin/master_vanue.routes")(app);
require("./app/routes/admin/user.routes")(app);
require("./app/routes/admin/transaction.routes")(app);
require("./app/routes/admin/commission.routes")(app);

require("./app/routes/marketing/myclient.routes")(app);
require("./app/routes/marketing/dashboard.routes")(app);
require("./app/routes/marketing/events.routes")(app);
require("./app/routes/marketing/myprofile.routes")(app);
require("./app/routes/marketing/transaction.routes")(app);
require("./app/routes/marketing/commission.routes")(app);
require("./app/routes/marketing/information.routes")(app);

require("./app/routes/website/wedding.routes")(app);
require("./app/routes/website/marketing.routes")(app);


app.get("/v2/", (req, res) => {
  res.json({ message: "Welcome to Viseetor API-2." });
}
);

dotenv.config();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server API-2 is running on port ${PORT}.`);
  console.log(new Date().toString());
}
);