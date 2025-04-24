from flask import Flask, render_template, request, jsonify
from chatterbot import ChatBot
from chatterbot.trainers import ListTrainer
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from sqlalchemy.sql import func
import json

app = Flask(__name__)

# Configuração do Banco de Dados
Base = declarative_base()

class Conversation(Base):
    __tablename__ = 'conversations'
    id = Column(Integer, primary_key=True)
    title = Column(String, default='Nova Conversa')
    created_at = Column(String, server_default=func.now())
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = 'messages'
    id = Column(Integer, primary_key=True)
    conversation_id = Column(Integer, ForeignKey('conversations.id'))
    text = Column(String)
    sender = Column(String)
    created_at = Column(String, server_default=func.now())
    conversation = relationship("Conversation", back_populates="messages")

engine = create_engine('sqlite:///./database.sqlite3')
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Chatbot
chatbot = ChatBot(
    'EcoIA',
    storage_adapter='chatterbot.storage.SQLStorageAdapter',
    database_uri='sqlite:///./database.sqlite3'
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

@app.route('/')
def index():
    return render_template('index.html')

#Rota do histórico
@app.route('/api/history')
def get_history():
    db = next(get_db())
    conversations = db.query(Conversation).order_by(Conversation.created_at.desc()).all()
    return jsonify([{'id': c.id, 'title': c.title} for c in conversations])

@app.route('/api/conversations/<int:conversation_id>')
def get_conversation(conversation_id):
    db = next(get_db())
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conv:
        return jsonify([{'text': m.text, 'sender': m.sender} for m in conv.messages])
    return jsonify([])

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message')
    conversation_id = data.get('conversation_id')
    db = next(get_db())

    if conversation_id:
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    else:
        conv = Conversation()
        db.add(conv)
        db.commit()
        db.refresh(conv)
        conversation_id = conv.id

    if conv:
        db.add(Message(conversation_id=conversation_id, text=user_message, sender='user'))
        db.commit()

        try:
            bot_response = str(chatbot.get_response(user_message))
            db.add(Message(conversation_id=conversation_id, text=bot_response, sender='bot'))
            db.commit()
            return jsonify({'response': bot_response, 'conversation_id': conversation_id})
        except Exception as e:
            return jsonify({'error': f'Erro no chatbot: {e}'}), 500

    return jsonify({'error': 'Conversa não encontrada'}), 404

# Criar nova conversa
@app.route('/api/conversations', methods=['POST'])
def create_conversation():
    db = next(get_db())
    new_conv = Conversation()
    db.add(new_conv)
    db.commit()
    return jsonify({'id': new_conv.id, 'title': new_conv.title})

# Renomear conversa
@app.route('/api/conversations/<int:conversation_id>', methods=['PUT'])
def rename_conversation(conversation_id):
    data = request.get_json()
    new_title = data.get('title')
    db = next(get_db())
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conv and new_title:
        conv.title = new_title
        db.commit()
        return jsonify({'success': True})
    return jsonify({'error': 'Conversa não encontrada ou título inválido'}), 400

# Excluir conversa
@app.route('/api/conversations/<int:conversation_id>', methods=['DELETE'])
def delete_conversation(conversation_id):
    db = next(get_db())
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conv:
        db.delete(conv)
        db.commit()
        return jsonify({'success': True})
    return jsonify({'error': 'Conversa não encontrada'}), 404

if __name__ == '__main__':
    app.run(debug=True)
