const { format } = require('date-fns');
const { id } = require('date-fns/locale');

const { ViseetorError } = require('../utils/errors');
const functions = require("../../config/function");

class Payment {

    constructor (logger, models, tripayConn) {
        this.logger = logger;
        this.models = models;
        this.tripayConn = tripayConn;
    }

    async createClose(orderNumber) {
        const { transaction, events, company, masterBankPayment } = this.models;

        const trx = await transaction.findOne({
            where: {
                order_number: orderNumber
            },
            include: [
                {
                    model: events,
                    attributes: ['title', 'event_date'],
                    include: [
                        {
                            model: company,
                            attributes: ['id', 'title', 'logo', 'address', 'contact_person', 'contact_phone', 'contact_email']
                        }
                    ]
                },
                {
                    model: masterBankPayment,
                    attributes: ['id', 'tripay_payment_method']
                }
            ],
            raw: true            
        });

        // custumer name get from events > fid_company > companies belong to transaction id

        const payload = {
            method: trx['master_bank_payment.tripay_payment_method'],
            amount: trx.total_payment,
            merchant_ref: orderNumber,
            customer_name: trx['event.company.contact_person'],
            customer_email: trx['event.company.contact_email'],
            customer_phone: trx['event.company.contact_phone'],
            order_items: [
                {
                    sku: trx.id,
                    name: trx['event.title'],
                    price: trx.total_payment,
                    quantity: 1,
                    product_url: '',
                    image_url: ''
                }
            ]
        };

        try {
            const tripayTrx = await this.tripayConn.createClosePayment(payload);

            const payloadtrx = {
                tripay_uuid: tripayTrx.data.reference,
                tripay_paycode: tripayTrx.data.pay_code,
                tripay_response_data: JSON.stringify(tripayTrx.data)
            }

            await transaction.update(payloadtrx, 
            {
                where: { order_number: orderNumber }
            });

            // TODO
            // send whatsapps to contact_phone contact_person sebagai nama penerima
            // send whatsapps to mitra 

            return tripayTrx.data;
        } catch (err) {
            this.logger.error(`[Payment Service] Error ${err}`);
            return err;
        }
    }
    
    async inquiry(orderNumber) {
        const { transaction } = this.models;

        try {
            const trx = await transaction.findOne({
                where: {
                    order_number: orderNumber
                }
            });

            if (trx == null) {
                return {
                    code: 404,
                    success: false,
                    message: 'Transaction not found'
                }
            }

            const trxTripayData = JSON.parse(trx.tripay_response_data);

            let result = {
                code: 200,
                success: true,
                message: "",
                data: {
                    transaction: {
                        id: trx.id,
                        orderNumber: trx.order_number,
                        createdAt: format(trx.createdAt, 'dd MMM, yyyy', {locale: id}),
                        totalPayment: trx.total_payment,
                        totalPaymentStr: trx.total_payment.toLocaleString('id-ID'),
                        status: trx.status,
                        paymentMethod: '',
                        checkoutUrl: ''
                    },
                    raw_tripay: trxTripayData
                }
            }

            if (trxTripayData != null ) {
                result.data.transaction.paymentMethod = trxTripayData.payment_name;
                result.data.transaction.checkoutUrl = trxTripayData.checkout_url
            }
            
            return result;
        } catch (err) {
            this.logger.error(`[Payment Services] inquiry ${err}`);
            return {
                code: 500,
                success: false,
                message: 'Internal Service Error'
            }
        }
    }

    /**
     * Payment received 
     * @param {*} param0 
     */
    async received ({order_number, status}) {
        const { transaction, events } = this.models;

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
        const { commission } = this.models;
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
