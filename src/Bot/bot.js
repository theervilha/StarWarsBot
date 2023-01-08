require('dotenv').config()
const axios = require('axios');
const Telegram = require('../Telegram/telegram')
const db = require('../Database/Database')
const set_extractor = require('../Extractors/SetExtractor')
const set_recognizer = require('../Recognizers/SetRecognizer')

class Bot {

    constructor() {
        this.SetExtractor = new set_extractor.SetExtractor()
        this.sets = this.SetExtractor.extract()
        this.SetRecognizer = new set_recognizer.SetRecognizer(this.sets)

        this.T = new Telegram.Telegram()
        this.DB = new db.Database();
        this.DB.connect()
        
        this.bot_responses = []
        this.context = ''
    }


    get_data_from_response(response) {
        this.response = response
        this.chat_id = this.response.message.chat.id
        this.created_at_user_message = new Date()
        this.get_user_message()
    }

    get_user_message() {
        try {
            this.user_message = this.SetExtractor.clean_text(this.response.message.text)
        } catch {
            this.user_message = ''
            this.context = ''
            print('!!!!!erro ao pegar resposta')
        }
    }

    async get_bot_response() {
        let sets_recognized_by_contains = this.SetRecognizer.get_sets_by_contains(this.user_message)
        console.log('sets_recognized_by_contains', sets_recognized_by_contains)
        console.log('sets', this.sets)
        if ('greetings' in sets_recognized_by_contains) {
            this.send_message( 
                'Olá!! Eu sou o Star Wars Bot. Minha missão é te fornecer informações sobre pessoas, planetas ou naves. Sobre o que você gostaria de saber?',
                ['sim', 'nao'], 
                {disable_web_page_preview: true}
            )
            this.context = 'greetings';
        }


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