require('dotenv').config()
const axios = require('axios');

class Telegram {
    constructor() {
        this.TOKEN = process.env.TELEGRAM_TOKEN;
        this.URL = `https://api.telegram.org/bot${this.TOKEN}`;
        this.send_message_url = `${this.URL}/sendMessage`
    }

    send_message(message, chat_id, buttons=[], ...kwargs) {  
        let data = {'text': message, 'chat_id': chat_id, "parse_mode": "HTML"}
        kwargs.forEach((arg) => {
            data = {...data, ...arg}
        })
        
        if (buttons.length > 0) {
            data['reply_markup'] = JSON.stringify({
                'keyboard': [
                    buttons.map((button) => ({'text': button}))
                ]
            })
        } else {  
            // Hide buttons interface on Telegram
            data['reply_markup'] = JSON.stringify({
                'hide_keyboard': true
            })
        }
        
        return axios.post(this.send_message_url, data)
            .catch(error=>{
                console.log('!!!!!\nAxios Error:',error);
            });;
    }
}

module.exports = {Telegram}