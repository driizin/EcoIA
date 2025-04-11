from flask import Flask, render_template, request, jsonify
from chatterbot import ChatBot
from chatterbot.trainers import ListTrainer
import json
import os

app = Flask(__name__)

# Inicialização do Chatbot ChatterBot (mantendo a mesma configuração)
chatbot = ChatBot(
    'EcoIA',
    storage_adapter='chatterbot.storage.SQLStorageAdapter',
    database_uri='sqlite:///./database.sqlite3'  # Caminho para o banco de dados SQLite
)

# Treinamento do Chatbot (mantendo a mesma lógica de carregamento do JSON)
trainer = ListTrainer(chatbot)

try:
    with open('./conteudos/ecologia.json', 'r', encoding='utf-8') as f:
        dados = json.load(f)
        for item in dados:
            pergunta = item.get('pergunta')
            resposta = item.get('resposta')
            if pergunta and resposta:
                trainer.train([pergunta, resposta])
except FileNotFoundError:
    print("Arquivo ecologia.json não encontrado. O chatbot pode não ter dados de treinamento.")
except Exception as e:
    print(f"Erro ao carregar/treinar do JSON: {e}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message')

    try:
        # Obter a resposta do ChatterBot
        bot_message = str(chatbot.get_response(user_message))

        # Retornar a resposta do bot como JSON
        return jsonify({'response': bot_message})
    except Exception as e:
        return jsonify({'error': f"Erro ao obter resposta do chatbot: {e}"}), 500

if __name__ == '__main__':
    app.run(debug=True)