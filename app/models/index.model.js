const dbConfig = require("../../config/db.config");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  logging: false,
  dialect: dbConfig.dialect,
  operatorsAliases: 0,
  useUTC: false,
  timestamps: false,
  //  ssl: true,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  },
  dialectOptions: {
    useUTC: false,
    dateStrings: true,
    timezone: "+07:00"
  },
  timezone: "+07:00"
});
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user/user.model")(sequelize, Sequelize);
db.userType = require("./user/user_type.model")(sequelize, Sequelize);
db.userProfile = require("./user/user_profile.model")(sequelize, Sequelize);

db.masterCompanyStatus = require("./master/master_company_status")(sequelize, Sequelize);
db.masterUserStatus = require("./master/status_user_model")(sequelize, Sequelize);
db.masterPaymentStatus = require("./master/status_payment_model")(sequelize, Sequelize);
db.masterEventStatus = require("./master/status_event_model")(sequelize, Sequelize);
db.masterEvent = require("./master/event_model")(sequelize, Sequelize);
db.masterIndustry = require("./master/industry_model")(sequelize, Sequelize);
db.masterVanue = require("./master/vanue_model")(sequelize, Sequelize);
db.masterBank = require("./master/bank_model")(sequelize, Sequelize);
db.masterOccupation = require("./master/occupation_model")(sequelize, Sequelize);
db.masterPrice = require("./master/master_price_model")(sequelize, Sequelize);
db.masterBankPayment = require("./master/bank_payment")(sequelize, Sequelize);

db.transaction = require("./transaction/transaction_model")(sequelize, Sequelize);
db.promotion = require("./transaction/promotion_model")(sequelize, Sequelize);
db.commission = require("./transaction/commission_model")(sequelize, Sequelize);
db.commissionWithdraw = require("./transaction/commission_withdrawal_model")(sequelize, Sequelize);

db.regProvincies = require("./master/reg_provinces_model")(sequelize, Sequelize);
db.regRegencies = require("./master/reg_regencies_model")(sequelize, Sequelize);
db.regDistrics = require("./master/reg_districts_model")(sequelize, Sequelize);
db.regVillages = require("./master/req_villages_model")(sequelize, Sequelize);
db.webTemplate = require("./master/template_model")(sequelize, Sequelize);

db.company = require("./company/company_model")(sequelize, Sequelize);
db.events = require("./event/events_model")(sequelize, Sequelize);
db.eventsWedding = require("./event/events_wedding_model")(sequelize, Sequelize);
db.eventsGallery = require("./event/events_gallery_model")(sequelize, Sequelize);
db.eventsGiftBank = require("./event/events_gift_bank_model")(sequelize, Sequelize);
db.eventsGuest = require("./event/events_guest_model")(sequelize, Sequelize);
db.eventsTicketing = require("./event/events_ticket_model")(sequelize, Sequelize);

db.information = require("./information/information_model")(sequelize, Sequelize);
db.informationFor = require("./information/information_for_model")(sequelize, Sequelize);

//Table Relation==========
//Table Relation==========
//Table Relation==========
db.userType.hasMany(db.user, { foreignKey: "fid_user_type" });
db.user.belongsTo(db.userType, { foreignKey: "fid_user_type" });
db.masterUserStatus.hasMany(db.user, { foreignKey: "fid_user_status" });
db.user.belongsTo(db.masterUserStatus, { foreignKey: "fid_user_status" });
db.user.hasOne(db.userProfile, { foreignKey: "fid_user" });
db.masterBank.hasMany(db.userProfile, { foreignKey: "fid_bank" });
db.userProfile.belongsTo(db.masterBank, { foreignKey: "fid_bank" });
db.masterOccupation.hasMany(db.userProfile, { foreignKey: "fid_occupation" });
db.userProfile.belongsTo(db.masterOccupation, { foreignKey: "fid_occupation" });
db.regRegencies.hasMany(db.userProfile, { foreignKey: "fid_regency" });
db.userProfile.belongsTo(db.regRegencies, { foreignKey: "fid_regency" });

db.regProvincies.hasMany(db.regRegencies, { foreignKey: "province_id" });
db.regRegencies.belongsTo(db.regProvincies, { foreignKey: "province_id" });
db.regRegencies.hasMany(db.regDistrics, { foreignKey: "regency_id" });
db.regDistrics.belongsTo(db.regRegencies, { foreignKey: "regency_id" });
db.regDistrics.hasMany(db.regVillages, { foreignKey: "district_id" });
db.regVillages.belongsTo(db.regDistrics, { foreignKey: "district_id" });

db.regRegencies.hasMany(db.company, { foreignKey: "fid_regencies" });
db.company.belongsTo(db.regRegencies, { foreignKey: "fid_regencies" });
db.masterIndustry.hasMany(db.company, { foreignKey: "fid_industry" });
db.company.belongsTo(db.masterIndustry, { foreignKey: "fid_industry" });
db.user.hasMany(db.company, { foreignKey: "fid_user" });
db.company.belongsTo(db.user, { foreignKey: "fid_user" });
db.masterCompanyStatus.hasMany(db.company, { foreignKey: "fid_company_status" });
db.company.belongsTo(db.masterCompanyStatus, { foreignKey: "fid_company_status" });

db.company.hasMany(db.events, { foreignKey: "fid_company" });
db.events.belongsTo(db.company, { foreignKey: "fid_company" });
db.events.hasOne(db.eventsWedding, { foreignKey: "fid_events" });
db.eventsTicketing.belongsTo(db.events, { foreignKey: "fid_events" });
db.events.hasMany(db.eventsGallery, { foreignKey: "fid_events" });
db.eventsGallery.belongsTo(db.events, { foreignKey: "fid_events" });
db.events.hasMany(db.eventsGiftBank, { foreignKey: "fid_events" });
db.eventsGiftBank.belongsTo(db.events, { foreignKey: "fid_events" });
db.events.hasMany(db.eventsGuest, { foreignKey: "fid_events" });
db.eventsGuest.belongsTo(db.events, { foreignKey: "fid_events" });
db.user.hasMany(db.eventsGuest, { foreignKey: "fid_user" });
db.eventsGuest.belongsTo(db.user, { foreignKey: "fid_user" });
db.events.hasMany(db.eventsTicketing, { foreignKey: "fid_events" });
db.eventsTicketing.belongsTo(db.events, { foreignKey: "fid_events" });
db.regRegencies.hasMany(db.events, { foreignKey: "fid_regencies" });
db.events.belongsTo(db.regRegencies, { foreignKey: "fid_regencies" });
db.user.hasMany(db.events, { foreignKey: "fid_user" });
db.events.belongsTo(db.user, { foreignKey: "fid_user" });
db.masterEvent.hasMany(db.events, { foreignKey: "fid_type" });
db.events.belongsTo(db.masterEvent, { foreignKey: "fid_type" });
db.masterEvent.hasMany(db.webTemplate, { foreignKey: "fid_type" });
db.webTemplate.belongsTo(db.masterEvent, { foreignKey: "fid_type" });
db.webTemplate.hasMany(db.events, { foreignKey: "fid_template" });
db.events.belongsTo(db.webTemplate, { foreignKey: "fid_template" });

db.events.hasMany(db.transaction, { foreignKey: "fid_events" });
db.transaction.belongsTo(db.events, { foreignKey: "fid_events" });
db.user.hasMany(db.transaction, { foreignKey: "fid_user" });
db.transaction.belongsTo(db.user, { foreignKey: "fid_user" });
db.masterBankPayment.hasMany(db.transaction, { foreignKey: "fid_bank_payment" });
db.transaction.belongsTo(db.masterBankPayment, { foreignKey: "fid_bank_payment" });
db.promotion.hasMany(db.transaction, { foreignKey: "fid_promotion" });
db.transaction.belongsTo(db.promotion, { foreignKey: "fid_promotion" });
db.masterPrice.hasMany(db.transaction, { foreignKey: "fid_price" });
db.transaction.belongsTo(db.masterPrice, { foreignKey: "fid_price" });
db.user.hasMany(db.promotion, { foreignKey: "fid_user" });
db.promotion.belongsTo(db.user, { foreignKey: "fid_user" });

db.user.hasMany(db.commission, { foreignKey: "fid_user" });
db.commission.belongsTo(db.user, { foreignKey: "fid_user" });

db.transaction.hasMany(db.commission, { foreignKey: "fid_transaction" });
db.commission.belongsTo(db.transaction, { foreignKey: "fid_transaction" });

db.user.hasMany(db.commissionWithdraw, { foreignKey: "fid_user" });
db.commissionWithdraw.belongsTo(db.user, { foreignKey: "fid_user" });

db.user.hasMany(db.information, { foreignKey: "fid_user" });
db.information.belongsTo(db.user, { foreignKey: "fid_user" });
db.information.hasMany(db.informationFor, { foreignKey: "fid_information" });
db.informationFor.belongsTo(db.information, { foreignKey: "fid_information" });
db.user.hasMany(db.informationFor, { foreignKey: "fid_user" });
db.informationFor.belongsTo(db.user, { foreignKey: "fid_user" });


module.exports = db;