from flask import Flask, render_template, request, jsonify
from chatterbot import ChatBot
from chatterbot.trainers import ListTrainer
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, func
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
import json

# Configuração do servidor
app = Flask(__name__)

# Configuração do banco de dados
Base = declarative_base()

class Conversation(Base):
    """
    Representa uma conversa no banco de dados
    """
    __tablename__ = 'conversations'
    id = Column(Integer, primary_key=True)
    title = Column(String, default='Nova Conversa')
    created_at = Column(String, server_default=func.now())
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    """
   Representa uma mensagem dentro de uma conversa
    """
    __tablename__ = 'messages'
    id = Column(Integer, primary_key=True)
    conversation_id = Column(Integer, ForeignKey('conversations.id'))
    text = Column(String)
    sender = Column(String)  # 'usuário' ou 'bot'
    created_at = Column(String, server_default=func.now())
    conversation = relationship("Conversation", back_populates="messages")

engine = create_engine('sqlite:///./database.sqlite3')  # Usando SQLite para simplicidade
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)

def get_db():
    """
    Fornece uma sessão de banco de dados.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Configuração do chatbot
chatbot = ChatBot(
    'EcoIA',
    storage_adapter='chatterbot.storage.SQLStorageAdapter',
    database_uri='sqlite:///./database.sqlite3'  # Usando o mesmo banco de dados SQLite
)
trainer = ListTrainer(chatbot)

def train_chatbot(trainer):
    """
    Treina o chatbot com dados de ecologia.json
    """
    try:
        with open('./conteudos/ecologia.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            for item in data:
                question = item.get('pergunta')
                answer = item.get('resposta')
                if question and answer:
                    trainer.train([question, answer])
    except Exception as e:
        print(f"Error training chatbot: {e}")

train_chatbot(trainer) # Treino do chatbot na inicialização

# Rotas

@app.route('/')
def index():
    """
    Renderiza a página principal
    """
    return render_template('index.html')

@app.route('/api/history')
def get_history():
    """
    Recupera o histórico da conversa
    """
    db = next(get_db())
    conversations = db.query(Conversation).order_by(Conversation.created_at.desc()).all()
    return jsonify([{'id': c.id, 'title': c.title} for c in conversations])

@app.route('/api/conversations/<int:conversation_id>')
def get_conversation(conversation_id):
    """
    Recupera uma conversa específica com suas mensagens
    """
    db = next(get_db())
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conversation:
        return jsonify([{'text': m.text, 'sender': m.sender} for m in conversation.messages])
    return jsonify([])  # Retornar lista vazia se a conversa não for encontrada

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Lida com o envio e recebimento de mensagens em uma conversa
    """
    data = request.get_json()
    user_message = data.get('message')
    conversation_id = data.get('conversation_id')
    db = next(get_db())

    if conversation_id:
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    else:
        conversation = Conversation()
        db.add(conversation)
        db.commit()
        db.refresh(conversation)  # Obtém o ID gerado
        conversation_id = conversation.id

    if conversation:
        db.add(Message(conversation_id=conversation_id, text=user_message, sender='user'))
        db.commit()

        try:
            bot_response = str(chatbot.get_response(user_message))
            db.add(Message(conversation_id=conversation_id, text=bot_response, sender='bot'))
            db.commit()
            return jsonify({'response': bot_response, 'conversation_id': conversation_id})
        except Exception as e:
            return jsonify({'error': f'Chatbot error: {e}'}), 500
    return jsonify({'error': 'Conversation not found'}), 404

@app.route('/api/conversations', methods=['POST'])
def create_conversation():
    """
    Cria uma nova conversa
    """
    db = next(get_db())
    new_conversation = Conversation()
    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)
    return jsonify({'id': new_conversation.id, 'title': new_conversation.title})

@app.route('/api/conversations/<int:conversation_id>', methods=['PUT'])
def rename_conversation(conversation_id):
    """
    Renomeia uma conversa existente
    """
    data = request.get_json()
    new_title = data.get('title')
    db = next(get_db())
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conversation and new_title:
        conversation.title = new_title
        db.commit()
        return jsonify({'success': True})
    return jsonify({'error': 'Conversation not found or invalid title'}), 400

@app.route('/api/conversations/<int:conversation_id>', methods=['DELETE'])
def delete_conversation(conversation_id):
    """
    Exclui uma conversa existente
    """
    db = next(get_db())
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conversation:
        db.delete(conversation)
        db.commit()
        return jsonify({'success': True})
    return jsonify({'error': 'Conversation not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
