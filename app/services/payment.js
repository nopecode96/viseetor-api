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

    async createOpen(orderNumber) {
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
                            attributes: ['id', 'title', 'logo', 'address', 'contact_person', 'contact_phone']
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
            merchant_ref: orderNumber,
            customer_name: trx['event.company.contact_person']
        }

        try {
            const tripayTrx = await this.tripayConn.createOpenPayment(payload);

            await transaction.update({ 
                tripay_uuid: tripayTrx.data.uuid,
                tripay_paycode: tripayTrx.data.pay_code,
                tripay_response_data: tripayTrx.data
            }, {
                where: { order_number: tripayTrx.merchant_ref }
            });

            // TODO
            // send whatsapps to contact_phone contact_person sebagai nama penerima
            // send whatsapps to mitra 

            return {
                code: 200,
                success: true,
                message: "",
                data: tripayTrx.data
            };

        } catch (err) {
            this.logger.error(`[Payment Service] Error ${err}`);
            return {
                code: 500,
                success: false,
                message: 'Downstream Tripay Error'
            };
        }
    }
    
    async inquiry({orderNumber}) {
        const trx = this.transactionModel.findOne({
            where: {
                order_number: orderNumber
            }
        });

        if (trx == null) {
            return {
                code: 404,
                success: false,
                message: 'Transaction not found',

            }
        }

        if (trx.status !== 'PAID') {
            const trxTripay = tripayConn.getDetail(reference);
        }

        const trxTripay = tripayConn.get(reference);

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
                    totalPaymentStr: trx.total_payment.toLocaleString('id-ID')
                    // paymentMethod: 
                },
                how_to_pay: [
                    "Login ke aplikasi BRImo Anda",
                    "Pilih menu <b>BRIVA</b>",
                    "Pilih sumber dana dan masukkan Nomor Pembayaran (<b>{{pay_code}}</b>) lalu klik <b>Lanjut</b>",
                    "Klik <b>Lanjut</b>",
                    "Detail transaksi akan ditampilkan, pastikan data sudah sesuai",
                    "Klik <b>Konfirmasi</b>",
                    "Klik <b>Lanjut</b>",
                    "Masukkan kata sandi ibanking Anda",
                    "Klik <b>Lanjut</b>",
                    "Transaksi sukses, simpan bukti transaksi Anda"
                ]
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