require('dotenv').config()
const axios = require('axios');

const Telegram = require('../Telegram/telegram')
const db = require('../Database/Database')
const set_extractor = require('../Extractors/SetExtractor')
const set_recognizer = require('../Recognizers/SetRecognizer')

class Bot {

    constructor() {
        console.log('pathBOT:',process.argv);
        this.SetExtractor = new set_extractor.SetExtractor()
        this.sets = this.SetExtractor.extract()
        this.SetRecognizer = new set_recognizer.SetRecognizer(this.sets)

        this.T = new Telegram.Telegram()
        this.DB = new db.Database();
        this.DB.connect()
        
        this.bot_responses = []
        this.context = ''
    }


    async get_data_from_response(response) {
        this.response = response
        this.chat_id = this.response.message.chat.id
        this.created_at_user_message = new Date()
        this.get_user_message()
        this.user_history = await this.DB.get_messages_by_chat_id(this.chat_id);
        this.context = ''
    }

    get_user_message() {
        try {
            this.user_message = this.SetExtractor.clean_text(this.response.message.text)
        } catch {
            this.user_message = ''
            print('!!!!!erro ao pegar resposta')
        }
    }

    async get_bot_response() {
        let sets_recognized_by_contains = this.SetRecognizer.get_sets_by_contains(this.user_message)
        console.log('sets_recognized_by_contains', sets_recognized_by_contains)
        
        if ('greetings' in sets_recognized_by_contains) {
            await this.send_message('Olá!! Eu sou o Star Wars Bot. Minha missão é te fornecer informações sobre pessoas, planetas ou naves. Sobre o que você gostaria de saber?')
            this.context = 'greetings';
        } 
        else if ('naves' in sets_recognized_by_contains) {
            this.fetch_starwars_and_send_message('naves');
            this.context = 'fetch_starships';
            await this.send_message("Você gostaria de fazer outra consulta?", ["Sim", "Não"]);
        } 
        else if ('pessoas' in sets_recognized_by_contains) {
            this.fetch_starwars_and_send_message('pessoas');
            this.context = 'fetch_people';
            await this.send_message("Você gostaria de fazer outra consulta?", ["Sim", "Não"]);
        } 
        else if ('planetas' in sets_recognized_by_contains) {
            this.fetch_starwars_and_send_message('planetas');
            this.context = 'fetch_planets';
            await this.send_message("Você gostaria de fazer outra consulta?", ["Sim", "Não"]);
        } else {
            this.context = 'not_handled'
        }

        if (this.context == 'not_handled') {
            await this.send_message('Desculpe, não entendi. Você gostaria de fazer uma consulta ou encerrar a conversa?');
        }


        if (this.user_history.length > 0) {
            let last_context = this.user_history[this.user_history.length -1].context;
            
            // If last context was about fetching data from starwars, check this:
            if (['fetch_starships', 'fetch_people', 'fetch_planets'].includes(last_context)) {
                if ('confirmacao' in sets_recognized_by_contains) {
                    this.context = 'wanna_fetch_data'
                } else if ('negacao' in sets_recognized_by_contains) {
                    this.context = 'finish_conversation'
                } else {
                    this.context = 'not_handled'
                }
            }

            // If the bot didn't understood last message, verify the new message here.
            if (last_context == 'not_handled') {
                if ('consultar' in sets_recognized_by_contains) {
                    this.context = 'wanna_fetch_data'
                } else if ('encerrar' in sets_recognized_by_contains) {
                    this.context = 'finish_conversation'
                } else {
                    self.context = 'not_handled'
                }
            }
        }

0
        if (this.context == 'wanna_fetch_data') {
            await this.send_message("Legal 🤩! \nPosso te fornecer informações sobre pessoas, planetas ou naves. Sobre o que você gostaria de saber?")
        }

        if (this.context == 'finish_conversation') {
            await this.send_message("Tchauzinho geek! Qualquer coisa me chama aqui para eu trazer mais informações sobre o mundo de Star Wars. Obrigado pela preferência, até mais!")
        }
    }    

    async send_message(message, buttons=[], ...kwargs) {
        await this.T.send_message(message, this.chat_id, buttons=buttons, ...kwargs);
        this.bot_responses.push(message);
    }

    async fetch_starwars_and_send_message(data_type) {
        let functions_per_data_type = {
            'naves': this.fetch_starships,
            'pessoas': this.fetch_people,
            'planetas': this.fetch_planets,
        }

        await this.send_message(`Certo! Estou consultando dados sobre ${data_type}...`);

        let list = await functions_per_data_type[data_type]();
        if (list.length > 0) {
            let send_string = "Encontrei os seguintes dados:\n";
            for (let [i, row] of list.entries()) { 
                send_string += `${i+1} - ${row.name}\n`;
            };
            await this.send_message(send_string)
        } else {
            await this.send_message("Infelizmente eu não consegui extrair nada :(.")
        }
    }

    async fetch_starships() {
        const res = await axios.get('https://swapi.dev/api/starships?format=json');
        const data = await res.data;
        return data.results;
    }
    
    async fetch_people() {
        const res = await axios.get('https://swapi.dev/api/people?format=json');
        const data = await res.data;
        return data.results;
    }
    
    async fetch_planets() {
        const res = await axios.get('https://swapi.dev/api/planets?format=json');
        const data = await res.data;
        return data.results;
    }

    store_data() {
        var bot_responses_str = this.bot_responses.join('\n\n\n');
        this.DB.insert_messages(
            [this.chat_id, this.context, this.user_message, bot_responses_str, this.created_at_user_message]
        )
        this.bot_responses = []
    }

}

module.exports = {Bot}