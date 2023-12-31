const { format } = require('date-fns');
const { id } = require('date-fns/locale');
const path = require('path');
const ejs = require('ejs');

const { ViseetorError } = require('../utils/errors');
const functions = require("../../config/function");

class Payment {

    constructor (logger, models, tripayConn, wapiConn) {
        this.logger = logger;
        this.models = models;
        this.tripayConn = tripayConn;
        this.wapiConn = wapiConn;
    }

    async createClose(orderNumber) {
        const { transaction, events, company, masterBankPayment, masterPrice  } = this.models;

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
                },
                {
                    model: masterPrice,
                    attributes: ['id', 'title']
                }
            ],
            raw: true            
        });

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
            
            // send whatsapps to client contact_phone contact_person sebagai nama penerima
            const dataWa = {
                name: trx['event.company.contact_person'],
                packageName: trx['master_price.title'],
                orderNumber: orderNumber,
                totalPaymentStr: trx.total_payment.toLocaleString('id-ID'),
                notes: '',
                tripayCheckoutUrl: tripayTrx.data.checkout_url
            }

            this._sendInvoiceToWa(trx['event.company.contact_phone'], dataWa)

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
        const { transaction, events, masterBankPayment, masterPrice } = this.models;

        if (!order_number) {
            throw new ViseetorError('Order number required', 400, 400);
        }

        try {
            const trx = await transaction.findOne({
                where: {
                    order_number: order_number
                },
                include: [
                    {
                        model: masterBankPayment,
                        attributes: ['id', 'tripay_payment_method']
                    },
                    {
                        model: masterPrice,
                        attributes: ['id', 'title', 'commission_supervisor', 'commission_group_leader']
                    }
                ],
                raw: true        
            });

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
            
            const addComm = await this.addCommisions({fid_user, order_number, total_commission, fid_transaction}, trx);

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

    async addCommisions({fid_user, order_number, total_commission, fid_transaction}, trxData) {
        const self = this;
        const { commission, user, transaction, userType } = this.models;

        const commisionData = await commission.findOne({
                where: { fid_user: fid_user },
                include: [
                    {
                        model: user,
                        attributes: ['id', 'fid_user_type', 'parent_id']
                    }
                ],
                order: [
                    ['id', 'DESC']
                ],
                raw: true
        });

        let balance = '0';
        if (!commisionData) {
            balance = '0';
        } else {
            balance = commisionData.balance;
        }

        const lastBalance = parseInt(total_commission) + parseInt(balance);

        try {
            const dataComm = this._transformCommision({order_number, total_commission, lastBalance, fid_user, fid_transaction});

            const commCreate = await commission.create(dataComm);

            if (commisionData && commisionData['user.parent_id'] != null && commisionData['user.parent_id'] > 0 
               && (trxData['master_price.commission_supervisor'] > 0 || trxData['master_price.commission_group_leader'] > 0)
               ) {

                const userParentId = commisionData['user.parent_id'];

                const findUserParent = await user.findOne({
                    where: {
                        id: userParentId
                    }
                })

                const userTypeParent = findUserParent.fid_user_type

                let commisionParent = 0;
                let payloadTrx;
                if (userTypeParent == 3) {
                    commisionParent = trxData['master_price.commission_supervisor'];
                    payloadTrx = {
                        unit_commission_supervisor: commisionParent
                    }
                } else if (userTypeParent == 4) { 
                    commisionParent = trxData['master_price.commission_group_leader'];
                    payloadTrx = {
                        unit_commission_group_leader: commisionParent
                    }
                }

                const totalComissionParent = commisionParent * parseInt(trxData.qty)

                Object.assign(payloadTrx, {
                    total_commission: parseInt(total_commission) + totalComissionParent
                }) 
                
                const updTrx = await transaction.update(payloadTrx, { 
                    where: { order_number: order_number}
                });

                const payComChild = {
                    fid_user: userParentId, 
                    order_number: order_number, 
                    total_commission: totalComissionParent,
                    fid_transaction: fid_transaction
                }

                return new Promise(resolve => {
                    setTimeout(() => resolve(self.addCommisions(payComChild, trxData)), 500)
                });
            }

            functions.auditLog('CREATE', 'Create Commission for Order No. #' + order_number, 'Any', 'commissions', commCreate.id)
            return commCreate;
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

    _sendInvoiceToWa(destination, data) {
        const filepath = (path.join(__dirname, 'templates/wa_invoice.ejs')).replace('services', '')
        const wapiConn = this.wapiConn;
        ejs.renderFile(filepath, data, {}, function(err, str){
            const wapiSendMessage = wapiConn.sendMessage(destination, str);

            return wapiSendMessage;
        });
    }

}

module.exports = Payment;
