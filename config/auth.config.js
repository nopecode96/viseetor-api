const jwt = require('jsonwebtoken');
const db = require("../app/models/index.model");
const User = db.user;

exports.tokenValidation = (req, res, next) => {
  let authToken = req.header('token-access');

  if (!authToken) {
    res.status(203).send({
      code: 203,
      status: false,
      message: "Please insert your Access Token"
    });
    return;
  }
  try {
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    var decript = jwt.decode(authToken, jwtSecretKey);
    const verified = jwt.verify(authToken, jwtSecretKey);
    if (!verified) {
      res.status(203).send({
        code: 203,
        status: false,
        message: 'Your Token not Valid',
      });
      return;
    } else {
      const userId = decript.userId;
      User.findAll({
        where: { id: userId, token: authToken }
      })
        .then(data => {
          if (data.length == 0) {
            res.status(203).send({
              code: 203,
              status: false,
              message: 'Your account is Expired, Please login again.',
            });
            return;
          } else {
            res.locals.userid = userId;
            req.userid = userId;
            next();
          }
        })
    }
  } catch (error) {
    res.status(203).send({
      code: 203,
      status: false,
      message: 'Error Token Validation',
      error: error,
    });
    return;
  }

}

exports.apiKeyValidation = (req, res, next) => {
  let apiKey = req.header('apiKey');
  let inviteMeApiKey = process.env.API_KEY;

  if (!apiKey) {
    res.status(203).send({
      code: 203,
      status: false,
      message: "You dont have API Key Access!"
    });
    return;
  }

  try {
    if (apiKey != inviteMeApiKey) {
      res.status(203).send({
        code: 203,
        status: false,
        message: 'Your API KEY not Valid!',
      });
      return;
    }
    next();
  } catch (error) {
    res.status(203).send({
      code: 203,
      status: false,
      message: 'Your API KEY not Valid! 1',
      error: error.message,
    });
    return;
  }

}