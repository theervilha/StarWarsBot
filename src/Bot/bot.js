require('dotenv').config()
const axios = require('axios');
const Telegram = require('../Telegram/telegram')

class Bot {

    constructor() {
        this.bot_responses = []
        this.context = ''
        this.T = new Telegram.Telegram()
    }


    get_data_from_response(response) {
        this.response = response
        this.chat_id = this.response.message.chat.id
        this.created_at_user_message = new Date()
        this.get_user_message()
    }

    get_user_message() {
        try {
            this.user_message = this.response.message.text
        } catch {
            this.user_message = ''
            this.context = ''
            print('!!!!!erro ao pegar resposta')
        }
    }

    get_bot_response() {
        this.send_message( 
            'teste',
            ['sim', 'nao'], 
            {disable_web_page_preview: true}
        )
    }    

    store_data() {
        return
    }

    send_message(message, buttons=[], ...kwargs) {
        this.T.send_message(message, this.chat_id, buttons=buttons, ...kwargs);
        this.bot_responses.push(message);
    }
}

module.exports = {Bot}