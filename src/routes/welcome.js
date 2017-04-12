const Request = require('request');
require('env2')('./config.env');

const handler = (request, reply) => {
  const tempCode = request.query.code;

  const data = {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code: tempCode
  };
  const options = {
    method: 'POST',
    body: data,
    json: true,
    url: 'https://github.com/login/oauth/access_token'
  };
  Request(options, (error, response, body) => {
    if (error) {
      console.log('There was an error posting the code request to Github: ', error);
      return reply.code(500);
    }
    if (!body.access_token) {
      console.log('No access token came back from github, just this body: ', body);
      return reply.code(500);
    }
    const headers = {
      'User-Agent': 'Reavis',
      Authorization: `token ${body.access_token}`
    };
    const getOptions = {
      url: 'https://api.github.com/user',
      headers
    };
    return Request.get(getOptions, (getError, getResponse, getBody) => {
      const parsedBody = JSON.parse(getBody);
      const jwtOptions = {
        exp: Date.now() + (24 * 60 * 60 * 1000),
        sub: 'githubData',
        status: 'loggedIn'
      };
      const payload = {
        user: {
          username: parsedBody.login,
          image_url: parsedBody.avatar_url,
          org_url: parsedBody.organizations_url
        }
      };
      console.log(payload);
      reply.redirect('/');
    });
  });
};

const options = {
  method: 'GET',
  path: '/welcome',
  handler
};

module.exports = options;
