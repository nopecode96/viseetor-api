const crypto = require('crypto');

const generateHmac = (algo, data, secretKey) => {
    //creating hmac object 
    const hmac = crypto.createHmac(algo, secretKey);
    //passing the data to be hashed
    hmac.update(data);
    //Creating the hmac in the required format
    return hmac.digest('hex');
}

module.exports = {
    generateHmac
}
