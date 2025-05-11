from flask import Flask, render_template, request, jsonify
from chatterbot import ChatBot
from chatterbot.trainers import ListTrainer
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from sqlalchemy.sql import func
import json
import os
import google.generativeai as genai
import base64
from datetime import datetime
from sqlalchemy.dialects.mysql import LONGTEXT
import spacy

nlp = spacy.load("pt_core_news_sm")


app = Flask(__name__)

# Configuração do Banco de Dados MySQL (já configurado anteriormente)
Base = declarative_base()


class Conversation(Base):
    __tablename__ = 'conversations'
    id = Column(Integer, primary_key=True)
    title = Column(String, default='Nova Conversa')
    created_at = Column(String, server_default="CURRENT_TIMESTAMP")
    messages = relationship(
        "Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = 'messages'
    id = Column(Integer, primary_key=True)
    conversation_id = Column(Integer, ForeignKey('conversations.id'))
    text = Column(String)
    image_data = Column(LONGTEXT)
    sender = Column(String)
    created_at = Column(String, server_default="CURRENT_TIMESTAMP")
    conversation = relationship("Conversation", back_populates="messages")


DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_USER = os.environ.get("DB_USER", "root")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
DB_NAME = os.environ.get("DB_NAME", "chatbot")

DATABASE_URL = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Configuração da API do Gemini
GOOGLE_GEMINI_API_KEY = os.environ.get("GOOGLE_GEMINI_API_KEY")
if GOOGLE_GEMINI_API_KEY is None:
    raise ValueError(
        "A variável de ambiente GOOGLE_GEMINI_API_KEY não está definida.")
genai.configure(api_key=GOOGLE_GEMINI_API_KEY)
# Escolha um modelo que suporte multimodalidade
model_gemini = genai.GenerativeModel("gemini-2.0-flash")

# Chatbot (configurado para usar MySQL também)
chatbot = ChatBot(
    'EcoIA',
    storage_adapter='chatterbot.storage.SQLStorageAdapter',
    database_uri=DATABASE_URL
)

trainer = ListTrainer(chatbot)
try:
    with open('./conteudos/ecologia.json', 'r', encoding='utf-8') as f:
        dados = json.load(f)
        for item in dados:
            pergunta = item.get('pergunta')
            resposta = item.get('resposta')
            if pergunta and resposta:
                trainer.train([pergunta, resposta])
except Exception as e:
    print(f"Erro ao treinar com JSON: {e}")


def obter_resposta_gemini(user_message, image_data=None):
    prompt_markdown = f"""
Responda com formatação Markdown (sem explicar que está usando markdown), incluindo:

- Títulos com `#`
- Subtítulos com `##`
- Listas com `-`
- Parágrafos bem definidos

Mensagem do usuário:
{user_message}
"""

    content_parts = [prompt_markdown]
    if image_data:
        try:
            image_bytes = base64.b64decode(image_data.split(',')[1])
            content_parts.append(
                {"mime_type": "image/jpeg", "data": image_bytes})
        except Exception as e:
            return f"Erro ao decodificar a imagem: {e}"

    try:
        response = model_gemini.generate_content(content_parts)
        response.resolve()
        bot_message = response.text if response and response.text else \
            "Desculpe, não consegui gerar uma resposta para essa mensagem (e/ou imagem)."
    except Exception as e:
        bot_message = f"Erro ao gerar resposta da Gemini: {e}"

    return bot_message


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/history')
def get_history():
    db = next(get_db())
    conversations = db.query(Conversation).order_by(
        Conversation.created_at.desc()).all()
    return jsonify([{'id': c.id, 'title': c.title} for c in conversations])


@app.route('/api/conversations/<int:conversation_id>', methods=['DELETE'])
def delete_conversation(conversation_id):
    db = next(get_db())
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id).first()
    if conv:
        db.delete(conv)
        db.commit()
        return jsonify({'message': f'Conversa {conversation_id} excluída com sucesso!'}), 200
    return jsonify({'error': 'Conversa não encontrada'}), 404


@app.route('/api/conversations/<int:conversation_id>', methods=['PUT'])
def rename_conversation(conversation_id):
    data = request.get_json()
    new_title = data.get('title')
    if not new_title:
        return jsonify({'error': 'Título não fornecido'}), 400

    db = next(get_db())
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id).first()
    if conv:
        conv.title = new_title
        db.commit()
        return jsonify({'message': f'Conversa {conversation_id} renomeada para "{new_title}"'}), 200
    return jsonify({'error': 'Conversa não encontrada'}), 404


@app.route('/api/conversations/<int:conversation_id>')
def get_conversation(conversation_id):
    db = next(get_db())
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id).first()
    if conv:
        return jsonify([{'text': m.text, 'image_data': m.image_data, 'sender': m.sender} for m in conv.messages])
    return jsonify([])


@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '')
    image_base64 = data.get('image')
    conversation_id = data.get('conversation_id')
    db = next(get_db())

    if image_base64:
        print(f"Tamanho da base64 recebida: {len(image_base64)}")

    if conversation_id:
        conv = db.query(Conversation).filter(
            Conversation.id == conversation_id).first()
    else:
        conv = Conversation()
        db.add(conv)
        db.commit()
        db.refresh(conv)
        # Extração de palavras-chave com spaCy
        doc = nlp(user_message)
        keywords = [
            token.text for token in doc
            if not token.is_stop and token.is_alpha and len(token.text) > 2
        ]
        palavras_chave = " ".join(dict.fromkeys(
            keywords[:3])) if keywords else "Nova Conversa"
        conv.title = palavras_chave.capitalize()
        db.commit()
        db.refresh(conv)
        conversation_id = conv.id

    if conv:
        # Armazenar a mensagem do usuário
        user_message_entry = Message(conversation_id=conversation_id,
                                     text=user_message, sender='user')
        if image_base64:
            user_message_entry.image_data = image_base64
            print(
                f"Tamanho da base64 ANTES de adicionar ao DB: {len(user_message_entry.image_data)}")
        db.add(user_message_entry)
        db.commit()
        if image_base64:
            db.refresh(user_message_entry)
            print(
                f"Tamanho da base64 DEPOIS de commitar ao DB: {len(user_message_entry.image_data)}")

        # Obter resposta do Gemini se houver imagem
        if image_base64:
            bot_response = obter_resposta_gemini(user_message, image_base64)
        else:
            try:
                bot_response = str(chatbot.get_response(user_message))
            except Exception as e:
                bot_response = f"Erro no ChatterBot: {e}"

        # Armazenar a resposta do bot
        db.add(Message(conversation_id=conversation_id,
                       text=bot_response, sender='bot'))
        db.commit()
        return jsonify({'response': bot_response, 'conversation_id': conversation_id})

    return jsonify({'error': 'Conversa não encontrada'}), 404

# Rotas para gerenciar conversas (criar, renomear, excluir) - permanecem as mesmas


if __name__ == '__main__':
    app.run(debug=True)
