
const { ViseetorError } = require('../utils/errors');
const { transaction, events, userType, commission } = require("../models/index.model");
const functions = require("../../config/function");

class Payment {

    constructor (args) {
        this.logger = args.logger;
    }
    
    /**
     * Payment received 
     * @param {*} param0 
     */
    async received ({order_number, status}) {
        if (!order_number) {
            throw new ViseetorError('Order number required', 400, 400);
        }

        try {
            const trx =  await transaction.findOne({where: {order_number: order_number}});

            if (!trx) {
                this.logger.error(`[DB] Transaction with order_number ${order_number} not found`);
                throw new ViseetorError(`Transaction not found`, 404, 404);
            }

            const fid_transaction = trx.id;

            const trxUpd = await transaction.update(
                { status: status },
                { 
                    where: {
                        order_number: order_number,
                    }
                }
            );

            if (trxUpd[0] == 0) {
                this.logger.error(`[DB] Transaction with order_number ${order_number} not valid`);
                throw new ViseetorError(`Transaction not valid`, 400, 400);
            }

            functions.auditLog('PUT', 'Accepted Transaction for Order No. #' + order_number, 'Any', 'transactions', fid_transaction)
            
            const fid_events = trx.fid_events;
            const fid_user = trx.fid_user;
            const total_commission = trx.total_commission;
            const qty = trx.qty;

            const eventData = await events.findOne({ where: { id: fid_events } });

            const invitation_limit = eventData.invitation_limit;
            const new_invitation_limit = parseInt(invitation_limit) + parseInt(qty);

            const eventUpd = await events.update({ invitation_limit: new_invitation_limit }, { where: { id: fid_events } });
            
            const addComm = await this.addCommisions({fid_user, order_number, total_commission, fid_transaction});

            return {
                code: 200,
                success: true,
                message: "Transaction Completed.",
                data: addComm
            }

        } catch (err) {
            this.logger.error(err);
            return err;
        }
        
    }

    async addCommisions({fid_user, order_number, total_commission, fid_transaction}) {

        console.log('order_number', order_number)
        const commisionData = await commission.findOne({where: { fid_user: fid_user }});

        let balance = '0';
        if (!commisionData) {
            balance = '0';
        } else {
            balance = commisionData.balance;
        }

        const lastBalance = parseInt(total_commission) + parseInt(balance);

        try {
            const commCreateBulk = await commission.bulkCreate([
                this._transformCommision({order_number, total_commission, lastBalance, fid_user, fid_transaction})
            ]);

            functions.auditLog('CREATE', 'Create Commission for Order No. #' + order_number, 'Any', 'commissions', commCreateBulk[0].id)
            return commCreateBulk;
        } catch (err) {
            return err;
        }
    }

    _transformCommision({order_number, total_commission, lastBalance, fid_user, fid_transaction}) {
        return {
            description: 'Commission from Order No. #' + order_number,
            nominal: total_commission,
            balance: lastBalance,
            action: 'IN',
            status: 'SATTLE',
            fid_user: fid_user,
            fid_transaction: fid_transaction
        }
    }

}

module.exports = Payment;
