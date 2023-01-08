require('dotenv').config()
const axios = require('axios');
const Telegram = require('../Telegram/telegram')
const db = require('../Database/Database')

class Bot {

    constructor() {
        this.bot_responses = []
        this.context = ''
        this.T = new Telegram.Telegram()
        this.DB = new db.Database();
        this.DB.connect()
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

    async get_bot_response() {
        this.user_history = await this.DB.get_messages_by_chat_id(this.chat_id);
        this.send_message( 
            'teste',
            ['sim', 'nao'], 
            {disable_web_page_preview: true}
        )
    }    

    store_data() {
        var bot_responses_str = this.bot_responses.join('\n\n\n');
        this.DB.insert_messages(
            [this.chat_id, this.context, this.user_message, bot_responses_str, this.created_at_user_message]
        )
        this.bot_responses = []
    }

    send_message(message, buttons=[], ...kwargs) {
        this.T.send_message(message, this.chat_id, buttons=buttons, ...kwargs);
        this.bot_responses.push(message);
    }
}

module.exports = {Bot}