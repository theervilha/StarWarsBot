require('dotenv').config()
const {Client} = require('pg');

class Database {
    message_table = 'message'
    create_message_table = `CREATE TABLE IF NOT EXISTS ${this.message_table} (id serial PRIMARY KEY, chat_id bigint, context varchar(100), user_message text, bot_response text, created_at_user_message timestamp);`;
    query_insert_messages = `INSERT INTO ${this.message_table} (chat_id, context, user_message, bot_response, created_at_user_message) VALUES ($1, $2, $3, $4, $5)`;
    query_select_messages_by_chat_id = `SELECT * FROM ${this.message_table} WHERE chat_id = $1`;
    
    constructor() {
        this.client = new Client({
            host: process.env.database_host,
            database: process.env.database_name,
            user: process.env.database_user,
            password: process.env.database_password,
            port: 5432,
        })
    }

    async connect() {
        await this.client.connect()
        await this.create_tables_if_not_exists()
    }
        
    async create_tables_if_not_exists() {
        this.client.query(this.create_message_table)
    }
    
    async get_messages_by_chat_id(chat_id) {
        const result = await this.client.query(this.query_select_messages_by_chat_id, [chat_id]);
        return result.rows;
    }

    async insert_messages(values) {
        await this.client.query(this.query_insert_messages, values);
    }

    close() {
        return this.client.end;
    }
}

module.exports = {Database}