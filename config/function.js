"use strict";

// var FCM = require('fcm-node');
// var serverKey = 'AAAALq8q4DE:APA91bEpnY4l1Kvt_g3dwyOl-0pRexXHWJihwscYv-yLY6w1j4NOS3A62SfskkchfJtRlifK0q_EVEOGSbUazqUCUJ7dGaynrF10zc07Yk0MIuAVWJUP8LTCxWZsV2JANRSebdeniBNi'; //put your server key here
// var firebase = new FCM(serverKey);

// const fetch = require('node-fetch');
// const { send } = require("express/lib/response");

// const taptalk_api_url = "https://sendtalk-api.taptalk.io/api/v1/message/send_whatsapp";
// const taptalk_token = "6fb4b670ee084e5a76df5a42deb515b6b03dd6f7da2b8085f3e267a394cc419b";


// module.exports.fcm = function fcm(to, title, body) {
//     var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
//         to: to, 
//         collapse_key: 'your_collapse_key',

//         notification: {
//             title: title, 
//             body: body 
//         },

//         data: {  //you can send only notification or only data(or include both)
//             my_key: 'my value',
//             my_another_key: 'my another value'
//         }
//     };

//     firebase.send(message, function(err, response, next){
//         if (err) {
//             console.log("Something has gone wrong! ");
//             console.log(err);
//             return false;
//             next;
//         } else {
//             console.log("Successfully sent with response: ", response);
//             return true;
//             next;
//         }
//     });
// }

module.exports.getPagination = function getPagination(page, size) {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;

    return { limit, offset };
};

module.exports.getPagingData = function getPagingData(data, page, limit) {
    const { count: totalItems, rows: datas } = data;
    const currentPage = page ? +page : 1;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, datas, totalPages, currentPage };
}

module.exports.auditLog = function auditLog(action, description, user_agent, module, table_id, fid_user, next) {
    const { auditLogAdmin } = require("../app/models/index.model");

    auditLogAdmin.create({ action, description, user_agent, module, table_id, fid_user })
        .then(data => {
            next;
        })
}