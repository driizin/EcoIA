from flask import Flask, render_template, request, jsonify
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from sqlalchemy.sql import func
import json
import os
import google.generativeai as genai
import base64
from datetime import datetime
from sqlalchemy.dialects.mysql import LONGTEXT
import logging
import spacy

nlp = spacy.load("pt_core_news_sm")

# Configuração do logger
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


app = Flask(__name__)

# --- Configuração do Banco de Dados MySQL ---
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


# --- Configuração da API do Gemini ---
GOOGLE_GEMINI_API_KEY = os.environ.get("GOOGLE_GEMINI_API_KEY")
if GOOGLE_GEMINI_API_KEY is None:
    raise ValueError(
        "A variável de ambiente GOOGLE_GEMINI_API_KEY não está definida.")
genai.configure(api_key=GOOGLE_GEMINI_API_KEY)
model_gemini = genai.GenerativeModel("gemini-1.5-flash")


# --- Prompt do Gemini para Ecologia ---
GEMINI_PROMPT = """
Você é um Bot Especialista em Ecologia, nomeado "EcoIA". Sua principal função é fornecer informações detalhadas, precisas e abrangentes sobre **todos os aspectos da ecologia**. Isso inclui suas variáveis, conceitos, processos, biomas, espécies, ecossistemas, problemas ambientais e suas soluções.

Seu conhecimento abrange uma vasta gama de fontes e contextos:
* **Fundamentos e conceitos:** Da ecologia básica à mais avançada.
* **Pesquisas e estudos científicos:** Incluindo metodologias e resultados, podendo referenciar formatos ABNT (Associação Brasileira de Normas Técnicas) para trabalhos acadêmicos se pertinente.
* **Reportagens e notícias:** Análise e informações sobre eventos ecológicos atuais, desastres ambientais, políticas de conservação, avanços em sustentabilidade, etc.
* **Documentos e publicações:** Artigos acadêmicos, teses, dissertações de estudantes de ensino médio, faculdade e pós-graduação, e documentos oficiais sobre ecologia.
* **Contexto global e local:** Abordagem de questões ecológicas tanto em nível global (problemas e soluções mundiais) quanto específico do Brasil (biomas brasileiros, legislação ambiental brasileira, casos de estudo nacionais).

**Regras de Comportamento:**

1.  **Foco em Ecologia para Texto e Processamento de Imagens:**
    * Se a **entrada do usuário for APENAS TEXTO**, sua primeira e mais importante tarefa é determinar se ela está *diretamente* relacionada a algum tema de ecologia (conforme as áreas de conhecimento acima).
    * **Se a entrada for APENAS TEXTO e *NÃO* for sobre ecologia, responda *APENAS* com a frase: "ASSUNTO_NAO_ECOLOGICO". Não adicione mais nada. Esta é uma palavra-chave para o sistema processar.**
    * **Se uma IMAGEM for fornecida (com ou sem texto), você DEVE sempre tentar interpretá-la e fornecer uma resposta relevante ou descritiva baseada em seu conteúdo. Você NUNCA deve usar a frase "ASSUNTO_NAO_ECOLOGICO" se uma imagem estiver presente na entrada.**

2.  **Profundidade:** Sempre que possível, forneça respostas detalhadas e completas, demonstrando seu conhecimento especializado. Use exemplos e explicações claras.
3.  **Atualização e Aprendizado (Simulado):** Procure integrar informações recentes e, se a pergunta se basear em interações anteriores (o histórico da conversa), utilize esse contexto para refinar sua resposta ou abordar o tópico de forma mais completa.
4.  **Recuperação de Limitações:** Se uma pergunta for muito específica, ambígua, ou se você não tiver informações suficientes para uma resposta totalmente precisa, admita que pode haver incertezas ou que a informação pode não ser completa. Você pode usar frases como "Embora eu me esforce para ser preciso, essa área pode ter variações ou dados limitadas..." ou "Essa é uma questão complexa e meu conhecimento pode ter algumas lacunas aqui..."

**Instrução para Recusa de Tópicos (APENAS PARA TEXTO):**

* **Lembre-se:** Se a entrada for **APENAS TEXTO** e **NÃO FOR** sobre ecologia, você deve responder exatamente com a seguinte frase:
    "**ASSUNTO_NAO_ECOLOGICO**"

**Exemplos de Interação (para guiar seu comportamento):**

* **Pergunta do Usuário:** "O que é fotossíntese?"
* **Sua Resposta Esperada:** "A fotossíntese é o processo pelo qual organismos, como plantas e algas, convertem energia luminosa em energia química, produzindo açúcares e oxigênio. É um pilar fundamental da ecologia, pois é a base da cadeia alimentar na maioria dos ecossistemas..." (e continua detalhando).

* **Pergunta do Usuário:** "Qual a melhor receita de bolo de chocolate?"
* **Sua Resposta Esperada:** "**ASSUNTO_NAO_ECOLOGICO**"

* **Pergunta do Usuário (com imagem de um carro):** "O que é isso?"
* **Sua Resposta Esperada:** "Parece ser um carro, um veículo motorizado. Posso fornecer informações sobre o impacto ambiental de veículos, como emissões de poluentes e alternativas sustentáveis de transporte, se desejar." (O bot descreve a imagem e tenta relacioná-la ao tema ecológico, se possível).

* **Pergunta do Usuário (com imagem de uma floresta):** "Qual bioma é este?"
* **Sua Resposta Esperada:** "Com base na imagem, que exibe uma densa vegetação e árvores de grande porte, parece ser uma floresta tropical. As florestas tropicais são biomas ricos em biodiversidade..." (O bot interpreta a imagem e responde).
"""

# Palavra-chave para identificar quando o Gemini não reconhece o assunto como ecológico (APENAS PARA TEXTO)
NOT_ECOLOGICAL_KEYWORD = "ASSUNTO_NAO_ECOLOGICO"


def obter_resposta_gemini(user_message, image_data=None, history=None):
    if GOOGLE_GEMINI_API_KEY is None:
        logger.error("Chave GOOGLE_GEMINI_API_KEY não definida. Incapaz de interagir com o Gemini.")
        return "Desculpe, a funcionalidade de IA está desabilitada devido a uma chave de API ausente."

    chat = model_gemini.start_chat(history=history or [])
    content_parts = []

    # Se houver imagem
    if image_data:
        try:
            image_bytes = base64.b64decode(image_data.split(',')[1] if ',' in image_data else image_data)
            content_parts.append({"mime_type": "image/jpeg", "data": image_bytes})
        except Exception as e:
            logger.error(f"Erro ao decodificar a imagem: {e}")
            return "Ocorreu um erro ao processar a imagem."

    # Só adiciona o prompt se for a primeira interação (sem histórico)
    if not history:
        content_parts.append(GEMINI_PROMPT)

    # Adiciona a mensagem do usuário se houver
    if user_message:
        content_parts.append(user_message)
    elif not user_message and not image_data:
        return "Por favor, forneça uma mensagem ou uma imagem para que eu possa responder."

    try:
        response = chat.send_message(content_parts)
        response.resolve()
        gemini_text_response = response.text.strip()

        if not image_data and NOT_ECOLOGICAL_KEYWORD in gemini_text_response:
            return "Desculpe, mas minha função é responder apenas sobre temas relacionados à ecologia. Por favor, faça uma pergunta sobre ecologia."
        else:
            return gemini_text_response

    except Exception as e:
        logger.error(f"Erro ao gerar resposta da Gemini: {e}")
        return "Desculpe, não consegui processar sua solicitação no momento. Por favor, tente novamente."



@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/history')
def get_history_route():
    db = next(get_db())
    conversations = db.query(Conversation).order_by(
        Conversation.created_at.desc()).all()
    return jsonify([{'id': c.id, 'title': c.title} for c in conversations])


@app.route('/api/conversations/<int:conversation_id>', methods=['DELETE'])
def delete_conversation_route(conversation_id):
    db = next(get_db())
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id).first()
    if conv:
        db.delete(conv)
        db.commit()
        return jsonify({'message': f'Conversa {conversation_id} excluída com sucesso!'}), 200
    return jsonify({'error': 'Conversa não encontrada'}), 404


@app.route('/api/conversations/<int:conversation_id>', methods=['PUT'])
def rename_conversation_route(conversation_id):
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
def get_conversation_route(conversation_id):
    db = next(get_db())
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id).first()
    if conv:
        return jsonify([{'text': m.text, 'image_data': m.image_data, 'sender': m.sender} for m in conv.messages])
    return jsonify([])


@app.route('/api/chat', methods=['POST'])
def chat_route():
    data = request.get_json()
    user_message = data.get('message', '')
    image_base64 = data.get('image')
    conversation_id = data.get('conversation_id')
    db = next(get_db())

    if image_base64:
        logger.info(f"Tamanho da base64 recebida: {len(image_base64)}")

    conv = None
    if conversation_id:
        conv = db.query(Conversation).filter(
            Conversation.id == conversation_id).first()

    if not conv:
        if not user_message and not image_base64:
            conv_title = "Nova Conversa"
        else:
            # Extrai palavras-chave usando spaCy
            doc = nlp(user_message)
            keywords = [
                token.text for token in doc
                if not token.is_stop and token.is_alpha and len(token.text) > 2
            ]
            conv_title = " ".join(dict.fromkeys(
                keywords[:3])) if keywords else "Nova Conversa"
            conv_title = conv_title.capitalize()

        conv = Conversation(title=conv_title)
        db.add(conv)
        db.commit()
        db.refresh(conv)
        conversation_id = conv.id

    # Armazena a mensagem do usuário
    user_message_entry = Message(conversation_id=conversation_id,
                                 text=user_message, sender='user')
    if image_base64:
        user_message_entry.image_data = image_base64
    db.add(user_message_entry)
    db.commit()
    db.refresh(user_message_entry)

    # Reconstroi histórico da conversa para o Gemini
    messages_history = db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.id != user_message_entry.id
    ).order_by(Message.created_at).all()

    gemini_history = []
    for msg in messages_history:
        if msg.sender == 'user':
            gemini_history.append({'role': 'user', 'parts': [msg.text]})
        elif msg.sender == 'bot':
            gemini_history.append({'role': 'model', 'parts': [msg.text]})

    # Gera resposta com Gemini
    bot_response = obter_resposta_gemini(
        user_message, image_base64, gemini_history)

    # Armazena resposta do bot
    db.add(Message(conversation_id=conversation_id,
                   text=bot_response, sender='bot'))
    db.commit()

    return jsonify({'response': bot_response, 'conversation_id': conversation_id})


if __name__ == '__main__':
    app.run(debug=True)
