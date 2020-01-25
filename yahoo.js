var unirest = require('unirest');

class YahooApi {    
    constructor(userId, config){
        this.config = config;
        this.userId = userId;
        this.portfolio_url = 'https://query1.finance.yahoo.com/v7/finance/desktop/portfolio';
    }

//var req = unirest('GET', 'https://api.login.yahoo.com/oauth2/request_auth?client_id=dj0yJmk9bjR3Rm5OekRXdE81JmQ9WVdrOVVrUnVRVkJoTkdVbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PWYy&redirect_uri=oob&response_type=code&language=en-us');

    get_portfolios(){
        var req = unirest('GET', this.portfolio_url);

        req.query({
            userId: this.userId,
        });
        
        req.headers({
            'Authorization': 'Bearer ' + this.config.yahoo_token.access_token,
        });
        
        req.end(function (res) {
            //if (res.error) throw new Error(res.error);
        
            return res.body;
        });
        
    }
}
module.exports = {
    YahooApi
};
