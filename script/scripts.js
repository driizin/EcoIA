let currentChatId = null; // Variável para armazenar o ID da conversa atual

document.addEventListener('DOMContentLoaded', () => { // Evento disparado quando o DOM está completamente carregado
    appendMessage("Olá meu caro usuário! Eu sou o EcoIA, a IA que te auxiliará em assuntos sobre ecologia. Qual é a sua dúvida?", 'bot-message'); // Adiciona a primeira mensagem do bot ao chat
    loadConversationHistory(); // Carrega o histórico de conversas ao carregar a página
});

/**
 * Carrega o histórico de conversas do servidor e atualiza a interface.
 */
function loadConversationHistory() {
    fetch('/api/history')
        .then(res => res.json()) // Converte a resposta para JSON
        .then(history => { // Manipula os dados do histórico
            document.getElementById('historyBox').innerHTML = ''; // Limpa a lista de conversas
            history.forEach(addConversationToHistory); // Adiciona cada conversa ao histórico na interface
        });
}

/**
 * Adiciona uma conversa ao histórico na interface.
 * @param {object} conversation - Objeto contendo informações da conversa (id, title).
 */
function addConversationToHistory(conversation) {
    const div = document.createElement('div');
    div.classList.add('conversation-item'); // Adiciona a classe para estilização
    div.dataset.conversationId = conversation.id; // Armazena o ID da conversa como um atributo de dados

    const title = document.createElement('span');
    title.textContent = conversation.title || 'Nova Conversa'; // Define o título da conversa
    title.classList.add('conversation-title'); // Adiciona a classe para estilização
    title.onclick = function () { // Função executada ao clicar no título da conversa
        currentChatId = conversation.id; // Define o ID da conversa atual
        loadChatForConversation(currentChatId); // Carrega as mensagens da conversa selecionada
        document.querySelectorAll('.conversation-item').forEach(item => item.classList.remove('selected')); // Remove a seleção de outros itens
        div.classList.add('selected'); // Adiciona a classe de seleção ao item clicado
    };

    const optionsButton = document.createElement('button');
    optionsButton.innerHTML = '&#8942;'; // Ícone de opções
    optionsButton.className = 'options-btn'; // Adiciona a classe para estilização
    optionsButton.onclick = (event) => { // Função executada ao clicar no botão de opções
        event.stopPropagation(); // Impede que o clique se propague para o título da conversa
        toggleOptions(conversation.id, optionsButton); // Mostra/oculta as opções da conversa
    };

    const optionsMenu = document.createElement('div');
    optionsMenu.className = 'options-menu'; // Adiciona a classe para estilização
    optionsMenu.dataset.conversationId = conversation.id; // Armazena o ID da conversa como um atributo de dados

    const renameOption = document.createElement('button');
renameOption.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="vertical-align: middle; margin-right: 6px;">
        <path d="M15.502 1.94a.5.5 0 0 1 0 .706l-1.793 1.793-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-2.853 2.853-2-2L3 11.44V14h2.56l7.089-7.207z"/>
    </svg>
    Renomear`;
renameOption.onclick = () => showRenameModal(conversation.id, conversation.title); // Mostra o modal de renomear
renameOption.classList.add('option-item'); // Adiciona a classe para estilização

const deleteOption = document.createElement('button');
deleteOption.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="vertical-align: middle; margin-right: 6px;">
        <path d="M5.5 5.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5z"/>
        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2H5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1h2.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3a.5.5 0 0 0 0 1H13.5a.5.5 0 0 0 0-1H2.5z"/>
    </svg>
    Excluir`;
deleteOption.onclick = () => deleteConversation(conversation.id); // Exclui a conversa
deleteOption.classList.add('option-item'); // Adiciona a classe para estilização

    optionsMenu.appendChild(renameOption);
    optionsMenu.appendChild(deleteOption);

    div.appendChild(title);
    div.appendChild(optionsButton);
    div.appendChild(optionsMenu);

    document.getElementById('historyBox').appendChild(div); // Adiciona o item da conversa ao histórico
}

/**
 * Mostra ou oculta o menu de opções de uma conversa.
 * @param {string} conversationId - ID da conversa.
 * @param {HTMLElement} button - Botão de opções clicado.
 */
function toggleOptions(conversationId, button) {
    const menu = document.querySelector(`.options-menu[data-conversation-id="${conversationId}"]`);
    if (menu) {
        menu.classList.toggle('show'); // Alterna a classe 'show' para exibir/ocultar o menu
        document.querySelectorAll('.options-menu.show').forEach(otherMenu => {
            if (otherMenu !== menu) {
                otherMenu.classList.remove('show'); // Oculta outros menus abertos
            }
        });
    }
}

/**
 * Adiciona um listener global para fechar os menus de opções ao clicar fora.
 */
window.addEventListener('click', (event) => {
    if (!event.target.matches('.options-btn') && !event.target.matches('.options-menu button')) {
        document.querySelectorAll('.options-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

/**
 * Inicia uma nova conversa, resetando o ID da conversa atual e limpando o chat.
 */
function startNewConversation() {
    currentChatId = null; // Reseta o ID da conversa atual
    document.getElementById('chatBox').innerHTML = ''; // Limpa a caixa de chat
    appendMessage("Olá meu caro usuário! Eu sou o EcoIA, a IA que te auxiliará em assuntos sobre ecologia. Qual é a sua dúvida?", 'bot-message'); // Adiciona a mensagem inicial do bot
}

/**
 * Exibe o modal para renomear a conversa.
 * @param {string} id - ID da conversa a ser renomeada.
 * @param {string} currentTitle - Título atual da conversa.
 */
function showRenameModal(id, currentTitle) {
    const modal = document.getElementById('renameConversationModal');
    const titleInput = document.getElementById('newConversationTitle');
    const confirmButton = document.getElementById('confirmRename');
    const cancelButton = document.getElementById('cancelRename');

    titleInput.value = currentTitle || ''; // Preenche o campo de título com o título atual
    modal.style.display = "block"; // Exibe o modal

    confirmButton.onclick = () => { // Evento ao clicar em confirmar a renomeação
        const newTitle = titleInput.value.trim();
        if (newTitle) {
            renameConversation(id, newTitle); // Chama a função para renomear a conversa no servidor
            modal.style.display = "none"; // Oculta o modal
            confirmButton.onclick = null; // Remove o listener para evitar múltiplos cliques
        } else {
            alert("Por favor, insira um novo título.");
        }
    };

    cancelButton.onclick = () => { // Evento ao clicar em cancelar a renomeação
        modal.style.display = "none"; // Oculta o modal
        confirmButton.onclick = null; // Remove o listener
    };

    window.onclick = (event) => { // Evento para fechar o modal ao clicar fora
        if (event.target == modal) {
            modal.style.display = "none";
            confirmButton.onclick = null; // Remove o listener
        }
    };
}

/**
 * Envia a solicitação para renomear a conversa no servidor.
 * @param {string} id - ID da conversa a ser renomeada.
 * @param {string} newTitle - Novo título para a conversa.
 */
function renameConversation(id, newTitle) {
    fetch(`/api/conversations/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title: newTitle})
    }).then(loadConversationHistory); // Recarrega o histórico após a renomeação
}

/**
 * Exibe o modal de confirmação para excluir uma conversa.
 * @param {string} id - ID da conversa a ser excluída.
 */
function deleteConversation(id) {
    const modal = document.getElementById('deleteConfirmationModal');
    const confirmButton = document.getElementById('confirmDelete');
    const cancelButton = document.getElementById('cancelDelete');
    const modalTitle = modal.querySelector('.modal-title');
    const modalMessage = modal.querySelector('.modal-message');

    modalTitle.textContent = 'Excluir bate-papo?';
    modalMessage.textContent = 'Você não vai ver mais esta conversa aqui e não será recuperada!';

    modal.style.display = "block"; // Exibe o modal

    confirmButton.onclick = () => { // Evento ao clicar em confirmar a exclusão
        fetch(`/api/conversations/${id}`, {method: 'DELETE'}).then(() => { // Envia a solicitação de exclusão ao servidor
            if (currentChatId == id) {
                currentChatId = null;
                document.getElementById('chatBox').innerHTML = ''; // Limpa o chat se a conversa atual for excluída
            }
            loadConversationHistory(); // Recarrega o histórico após a exclusão
            modal.style.display = "none"; // Oculta o modal
        });
    };

    cancelButton.onclick = () => { // Evento ao clicar em cancelar a exclusão
        modal.style.display = "none"; // Oculta o modal
    };

    window.onclick = (event) => { // Evento para fechar o modal ao clicar fora
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
}

/**
 * Carrega as mensagens de uma conversa específica do servidor e as exibe no chat.
 * @param {string} conversationId - ID da conversa para carregar.
 */
function loadChatForConversation(conversationId) {
    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML = ''; // Limpa a caixa de chat

    fetch(`/api/conversations/${conversationId}`)
        .then(res => res.json()) // Converte a resposta para JSON
        .then(messages => { // Manipula as mensagens recebidas
            messages.forEach(msg => {
                appendMessage(msg.text, msg.sender === 'user' ? 'user-message' : 'bot-message'); // Adiciona cada mensagem ao chat
            });
        });
}

/**
 * Envia uma mensagem de texto do usuário para o servidor.
 */
function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    if (!message) return;

    appendMessage(message, 'user-message'); // Adiciona a mensagem do usuário ao chat
    input.value = ''; // Limpa o campo de entrada

    fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message, conversation_id: currentChatId}) // Envia a mensagem e o ID da conversa
    })
        .then(res => res.json()) // Converte a resposta para JSON
        .then(data => { // Manipula a resposta do bot
            appendMessage(data.response, 'bot-message'); // Adiciona a resposta do bot ao chat
            if (!currentChatId && data.conversation_id) {
                currentChatId = data.conversation_id; // Atualiza o ID da conversa se for uma nova conversa
                loadConversationHistory(); // Recarrega o histórico
            }
        });
}

/**
 * Adiciona uma mensagem ao chat na interface.
 * @param {string} text - Texto da mensagem a ser adicionada.
 * @param {string} className - Classe CSS para estilizar a mensagem (user-message ou bot-message).
 */
function appendMessage(text, className) {
    const chatBox = document.getElementById('chatBox');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`; // Define as classes CSS da mensagem
    msgDiv.innerHTML = text; // Define o conteúdo da mensagem
    chatBox.appendChild(msgDiv); // Adiciona a mensagem à caixa de chat
    chatBox.scrollTop = chatBox.scrollHeight; // Rola a caixa de chat para mostrar a última mensagem
}

/**
 * Adiciona um listener para enviar a mensagem ao pressionar a tecla Enter no campo de entrada.
 */
document.getElementById('userInput').addEventListener('keyup', e => {
    if (e.key === 'Enter') sendMessage();
});