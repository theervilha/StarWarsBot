const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;
const host = process.env.HOST || "localhost";


const Telegram = require('./Telegram/telegram')

// Rota que o telegram envia POST no webhook
const T = new Telegram.Telegram()
app.post("/api/handle_message", (req, res) => {
    console.log('Request Telegram Body:',req.body)

    T.send_message(
        message='Teste', 
        chat_id=800673480, 
        buttons=['sim', 'nao'], 
        disable_web_page_preview={disable_web_page_preview: true}
    )

	res.status(200).send("Success!");
});

app.use((req, res) => {
	res.status(404).send("API don´t handle this route");
});

app.listen(port, host, () => {
	console.log(`API listening on ${host} with port ${port}`);
});