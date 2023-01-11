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
        
        if ('greetings' in sets_recognized_by_contains) {
            await this.send_message( 
                'Olá!! Eu sou o Star Wars Bot. Minha missão é te fornecer informações sobre pessoas, planetas ou naves. Sobre o que você gostaria de saber?',
                ['sim', 'nao'], 
                {disable_web_page_preview: true}
            )
            this.context = 'greetings';
        } 
        else if ('naves' in sets_recognized_by_contains) {
            this.fetch_starwars_api('naves');
        } 
        else if ('pessoas' in sets_recognized_by_contains) {
            this.fetch_starwars_api('pessoas');
        } 
        else if ('planetas' in sets_recognized_by_contains) {
            this.fetch_starwars_api('planetas');
        }
    }    

    async fetch_starwars_api(data_type) {
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

    async send_message(message, buttons=[], ...kwargs) {
        await this.T.send_message(message, this.chat_id, buttons=buttons, ...kwargs);
        this.bot_responses.push(message);
    }
}

module.exports = {Bot}