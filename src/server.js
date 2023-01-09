const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;
//const host = process.env.HOST || "localhost";


const BotModule = require('./Bot/bot')

// Rota que o telegram envia POST no webhook
const Bot = new BotModule.Bot();
app.post("/api/handle_message", (req, res) => {
    Bot.get_data_from_response(req.body)
    Bot.get_bot_response()
    Bot.store_data()

	res.status(200).send("Success!");
});

app.use((req, res) => {
	res.status(404).send("API don´t handle this route");
});

// app.listen(port, host, () => {
// 	console.log(`API listening on ${host} with port ${port}`);
// });

app.listen(port, () => {
	console.log(`API listening with port ${port}`);
});