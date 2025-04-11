import json
from chatterbot import ChatBot
from chatterbot.trainers import ListTrainer

chatbot = ChatBot("EcoIA")
trainer = ListTrainer(chatbot)

with open('./conteudos/ecologia.json', 'r', encoding='utf-8') as f:
    dados = json.load(f)
    for item in dados:
        pergunta = item.get('pergunta')
        resposta = item.get('resposta')
        if pergunta and resposta:
            trainer.train([pergunta, resposta])

while True:
    mensagem = input("Usuário: ")
    resposta = chatbot.get_response(mensagem)
    print(resposta) 