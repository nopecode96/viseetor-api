module.exports = (sequelize, Sequelize) => {
  const auditLogAdmin = sequelize.define("audit_log_admin", {
    action: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.TEXT
    },
    user_agent: {
      type: Sequelize.TEXT
    },
    module: {
      type: Sequelize.TEXT
    },
    table_id: {
      type: Sequelize.STRING
    },
  }
  );
  return auditLogAdmin;
};