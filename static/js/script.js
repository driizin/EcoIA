let currentChatId = null;
let toggleMenuBtn;
let historyArea;
let base64ImageFromPaste = null;
let imageFile = null;

document.addEventListener("DOMContentLoaded", () => {
  appendMessage(
    "Olá meu caro usuário! Eu sou o EcoIA, a IA que te auxiliará em assuntos sobre ecologia. Qual é a sua dúvida?",
    "bot_message"
  );

  let isMenuFixed = false;
  let isHoveringMenu = false;
  let timeoutId;
  let menuOpen = false;

  toggleMenuBtn = document.getElementById("toggleMenuBtn");
  historyArea = document.getElementById("historyArea");

  function updateMenuButtonTooltip() {
    if (menuOpen) {
      if (isMenuFixed) {
        toggleMenuBtn.title = "Fechar menu";
      } else {
        toggleMenuBtn.title = "Manter menu aberto";
      }
    } else {
      toggleMenuBtn.title = "Abrir menu";
    }
  }

  toggleMenuBtn.addEventListener("mouseenter", () => {
    updateMenuButtonTooltip();
  });

  function openMenu() {
    if (!menuOpen) {
      historyArea.classList.remove("closed");
      menuOpen = true;
      updateMenuButtonTooltip();
    }
  }

  function closeMenu() {
    if (menuOpen) {
      historyArea.classList.add("closed");
      menuOpen = false;
      updateMenuButtonTooltip();
    }
  }

  toggleMenuBtn.addEventListener("click", () => {
    if (isMenuFixed) {
      isMenuFixed = false;
      closeMenu();
    } else {
      isMenuFixed = true;
      openMenu();
    }
  });

  historyArea.addEventListener("mouseenter", () => {
    isHoveringMenu = true;
    if (!isMenuFixed) {
      clearTimeout(timeoutId);
      openMenu();
    }
  });

  historyArea.addEventListener("mouseleave", () => {
    isHoveringMenu = false;
    if (!isMenuFixed) {
      timeoutId = setTimeout(closeMenu, 200);
    }
  });

  updateMenuButtonTooltip();
  closeMenu();
  loadConversationHistory();

  const inputArea = document.querySelector(".input-area");
  const imageInput = document.getElementById("imageInput");
  const imagePreviewContainer = document.getElementById(
    "imagePreviewContainer"
  );
  const userInput = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox"); // Obtém a chatBox aqui
  const imageUploadIcon = document.querySelector(".image-upload-icon");

  // Cria dinamicamente o overlay de arrastar
  const dragOverlay = document.createElement("div");
  dragOverlay.className = "drag-overlay";
  dragOverlay.id = "dragOverlay";
  dragOverlay.innerHTML = `
  <div class="drag-icon">
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="rgb(15, 50, 20)" viewBox="0 0 24 24">
      <path d="M5 20h14a2 2 0 0 0 2-2V8l-6-6H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Zm0-2V4h10v4h4v10H5ZM7 9h10v2H7V9Zm0 4h10v2H7v-2Z"/>
    </svg>
    <p>Solte a imagem aqui para enviar</p>
  </div>
`;
  inputArea.appendChild(dragOverlay);

  // Suporte a drag-and-drop (imagem arrastada na área de input)
  inputArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    inputArea.classList.add("drag-over");
  });

  inputArea.addEventListener("dragleave", () => {
    inputArea.classList.remove("drag-over");
  });

  inputArea.addEventListener("drop", (e) => {
    e.preventDefault();
    inputArea.classList.remove("drag-over");

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        base64ImageFromPaste = event.target.result;
        displayImagePreview(base64ImageFromPaste);
      };
      reader.readAsDataURL(file);
    }
  });

  if (imageUploadIcon) {
    imageUploadIcon.addEventListener("click", () => {
      imageInput.click();
    });
  }

  // Listener para upload de arquivo (mantido e levemente ajustado)
  imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Usa a mesma função displayImagePreview para ambos (upload e paste)
        displayImagePreview(e.target.result);
        base64ImageFromPaste = e.target.result; // Armazena também para consistência
      };
      reader.readAsDataURL(file);
    } else {
      clearImagePreview(); // Limpa se nenhum arquivo for selecionado
    }
  });

  // NOVO: Listener para o evento de colar na área de input
  userInput.addEventListener("paste", handlePaste);

  // Removido o bloco de código complexo do paste que estava aqui.
  // A lógica foi movida para a função handlePaste e displayImagePreview.
}); // <-- Este é o fechamento correto do DOMContentLoaded

// Função para lidar com o evento de colar (NOVA FUNÇÃO OU REESTRUTURADA)
function handlePaste(event) {
  const items = (event.clipboardData || event.originalEvent.clipboardData)
    .items;
  let imageFound = false;

  for (const item of items) {
    if (item.type.indexOf("image") !== -1) {
      const blob = item.getAsFile();
      const reader = new FileReader();

      reader.onload = (e) => {
        base64ImageFromPaste = e.target.result; // Armazena a imagem em base64
        imageFile = null;
        displayImagePreview(base64ImageFromPaste); // Exibe o preview usando a função unificada
      };
      reader.readAsDataURL(blob);
      imageFound = true;
      event.preventDefault(); // Importante para evitar o comportamento padrão de colar
      break; // Já encontramos uma imagem, podemos sair do loop
    }
  }
  if (!imageFound) {
    clearImagePreview(); // Limpa se não for imagem
  }
}

// Função para exibir o preview da imagem (UNIFICADA para upload e paste)
function displayImagePreview(imageUrl) {
  const imagePreviewContainer = document.getElementById(
    "imagePreviewContainer"
  );
  const inputArea = document.querySelector(".input-area");

  // Limpa qualquer conteúdo anterior
  imagePreviewContainer.style.display = ""; // ADICIONADO
  imagePreviewContainer.innerHTML = "";

  const previewDiv = document.createElement("div");
  previewDiv.classList.add("pasted-image-preview-wrapper"); // Adiciona uma classe para estilização
  previewDiv.style.position = "relative";
  previewDiv.style.display = "inline-block";
  previewDiv.style.marginRight = "5px";

  const img = document.createElement("img");
  img.src = imageUrl;
  img.alt = "Prévia da imagem";
  img.classList.add("pasted-image-preview"); // Adiciona a classe para estilização CSS

  const removeButton = document.createElement("button");
  removeButton.classList.add("remove-image-button");
  removeButton.innerHTML = `
    <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
      width="16pt" height="16pt" viewBox="0 0 559.000000 447.000000"
      preserveAspectRatio="xMidYMid meet" fill="currentColor">
    <g transform="translate(0.000000,447.000000) scale(0.100000,-0.100000)"
    fill="currentColor" stroke="none">
    <path d="M2150 3162 c-38 -20 -80 -89 -80 -132 1 -14 6 -37 13 -52 7 -14 269
    -285 583 -602 499 -502 577 -576 613 -586 98 -26 192 46 191 147 -1 21 -6 48
    -13 59 -22 40 -1131 1154 -1163 1169 -43 20 -102 19 -144 -3z"/>
    <path d="M3312 3165 c-18 -8 -133 -114 -254 -235 l-222 -221 107 -107 107
    -107 221 220 c121 121 227 232 235 247 34 65 6 158 -61 195 -46 26 -86 28
    -133 8z"/>
    <path d="M2303 2218 c-232 -234 -243 -250 -228 -319 12 -52 69 -107 120 -115
    82 -12 103 2 328 226 114 114 207 211 207 216 0 5 -47 55 -103 112 l-102 102
    -222 -222z"/>
    </g>
    </svg>
  `;
  removeButton.onclick = clearImagePreview; // Chama a função unificada de limpeza

  previewDiv.appendChild(img);
  previewDiv.appendChild(removeButton);
  imagePreviewContainer.appendChild(previewDiv);

  inputArea.classList.add("has-image"); // Adiciona a classe para ajustar o layout
}

// Função para limpar o preview da imagem (UNIFICADA)
function clearImagePreview() {
  base64ImageFromPaste = null;
  document.getElementById("imageInput").value = ""; // Limpa o input de arquivo
  const imagePreviewContainer = document.getElementById(
    "imagePreviewContainer"
  );
  if (imagePreviewContainer) {
    imagePreviewContainer.innerHTML = ""; // Limpa o conteúdo do container
    imagePreviewContainer.style.display = "none"; // ADICIONADO: Esconde o container
  }
  const inputArea = document.querySelector(".input-area");
  inputArea.classList.remove("has-image"); // Remove a classe para ajustar o layout
}

//Função de carregar conversa salva
function loadConversationHistory() {
  fetch("/api/history")
    .then((res) => res.json())
    .then((history) => {
      const historyBox = document.getElementById("historyBox");
      historyBox.innerHTML = "";
      const initialCount = Math.min(history.length, 5);
      let allConversationsVisible = initialCount >= history.length;

      for (let i = 0; i < initialCount; i++) {
        addConversationToHistory(history[i]);
      }

      if (history.length > 5) {
        // Adicionamos esta condição
        const showMoreButton = document.createElement("button");
        showMoreButton.textContent = "Mostrar mais";
        showMoreButton.classList.add("show-more-btn");

        showMoreButton.addEventListener("click", () => {
          if (!allConversationsVisible) {
            for (let i = initialCount; i < history.length; i++) {
              addConversationToHistory(history[i]);
            }
            showMoreButton.textContent = "Mostrar menos";
            allConversationsVisible = true;
          } else {
            historyBox.innerHTML = "";
            for (let i = 0; i < initialCount; i++) {
              addConversationToHistory(history[i]);
            }
            showMoreButton.textContent = "Mostrar mais";
            allConversationsVisible = false;

            if (history.length > initialCount) {
              historyBox.appendChild(showMoreButton);
            }
          }
        });
        historyBox.appendChild(showMoreButton);
      }
    });
}

//Salvar a conversa
function addConversationToHistory(conversation) {
  const div = document.createElement("div");
  div.classList.add("conversation-item");
  div.dataset.conversationId = conversation.id;

  const title = document.createElement("span");
  title.textContent = conversation.title || "Nova Conversa";
  title.classList.add("conversation-title");
  title.onclick = function () {
    currentChatId = conversation.id;
    loadChatForConversation(currentChatId);
    document
      .querySelectorAll(".conversation-item")
      .forEach((item) => item.classList.remove("selected"));
    div.classList.add("selected");
  };

  //Botão de adicionar conversa
  const optionsButton = document.createElement("button");
  optionsButton.innerHTML = "&#8942;";
  optionsButton.className = "options-btn";
  optionsButton.onclick = (event) => {
    event.stopPropagation();
    toggleOptions(conversation.id, optionsButton);
  };

  //Botão de opções
  const optionsMenu = document.createElement("div");
  optionsMenu.className = "options-menu";
  optionsMenu.dataset.conversationId = conversation.id;

  //Botão de renomear a convesa
  const renameOption = document.createElement("button");
  renameOption.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="vertical-align: middle; margin-right: 6px;">
        <path d="M15.502 1.94a.5.5 0 0 1 0 .706l-1.793 1.793-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-2.853 2.853-2-2L3 11.44V14h2.56l7.089-7.207z"/>
      </svg>
      Renomear`;
  renameOption.onclick = () =>
    showRenameModal(conversation.id, conversation.title);
  renameOption.classList.add("option-item");

  //Botão de renomear a convesa
  const deleteOption = document.createElement("button");
  deleteOption.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="vertical-align: middle; margin-right: 6px;">
        <path d="M5.5 5.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5z"/>
        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2H5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1h2.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3a.5.5 0 0 0 0 1H13.5a.5.5 0 0 0 0-1H2.5z"/>
      </svg>
      Excluir`;
  deleteOption.onclick = () => deleteConversation(conversation.id);
  deleteOption.classList.add("option-item");

  optionsMenu.appendChild(renameOption);
  optionsMenu.appendChild(deleteOption);

  div.appendChild(title);
  div.appendChild(optionsButton);
  div.appendChild(optionsMenu);

  document.getElementById("historyBox").appendChild(div);
}

function toggleOptions(conversationId, button) {
  const menu = document.querySelector(
    `.options-menu[data-conversation-id="${conversationId}"]`
  );
  if (menu) {
    menu.classList.toggle("show");
    document.querySelectorAll(".options-menu.show").forEach((otherMenu) => {
      if (otherMenu !== menu) {
        otherMenu.classList.remove("show");
      }
    });
  }
}

window.addEventListener("click", (event) => {
  if (
    !event.target.matches(".options-btn") &&
    !event.target.matches(".options-menu button")
  ) {
    document.querySelectorAll(".options-menu.show").forEach((menu) => {
      menu.classList.remove("show");
    });
  }
});

//Iniciar uma conversa
function startNewConversation() {
  currentChatId = null;
  document.getElementById("chatBox").innerHTML = "";
  appendMessage(
    "Olá meu caro usuário! Eu sou o EcoIA, a IA que te auxiliará em assuntos sobre ecologia. Qual é a sua dúvida?",
    "bot_message"
  );
  clearImagePreview(); // Limpa o preview ao iniciar nova conversa
}
("");
//Renomar conversa salva
function showRenameModal(id, currentTitle) {
  const modal = document.getElementById("renameConversationModal");
  const titleInput = document.getElementById("newConversationTitle");
  const confirmButton = document.getElementById("confirmRename");
  const cancelButton = document.getElementById("cancelRename");

  titleInput.value = currentTitle || "";
  modal.style.display = "block";

  confirmButton.onclick = () => {
    const newTitle = titleInput.value.trim();
    if (newTitle) {
      renameConversation(id, newTitle);
      modal.style.display = "none";
      confirmButton.onclick = null;
    } else {
      // Substituído alert por uma mensagem no console ou modal customizado se preferir
      console.warn("Por favor, insira um novo título.");
    }
  };

  cancelButton.onclick = () => {
    modal.style.display = "none";
    confirmButton.onclick = null;
  };

  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
      confirmButton.onclick = null;
    }
  };
}

function renameConversation(id, newTitle) {
  fetch(`/api/conversations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: newTitle }),
  }).then(loadConversationHistory);
}

//Remover conversa salva
function deleteConversation(id) {
  const modal = document.getElementById("deleteConfirmationModal");
  const confirmButton = document.getElementById("confirmDelete");
  const cancelButton = document.getElementById("cancelDelete");
  const modalTitle = modal.querySelector(".modal-title");
  const modalMessage = modal.querySelector(".modal-message");

  modalTitle.textContent = "Excluir bate-papo?";
  modalMessage.textContent =
    "Você não vai ver mais esta conversa aqui. Essa ação também vai excluir atividades relacionadas a ecologia";

  modal.style.display = "block";

  confirmButton.onclick = () => {
    fetch(`/api/conversations/${id}`, { method: "DELETE" }).then(() => {
      if (currentChatId == id) {
        currentChatId = null;
        document.getElementById("chatBox").innerHTML = "";
        appendMessage(
          // Adiciona a mensagem inicial após excluir a conversa atual
          "Olá meu caro usuário! Eu sou o EcoIA, a IA que te auxiliará em assuntos sobre ecologia. Qual é a sua dúvida?",
          "bot_message"
        );
      }
      loadConversationHistory();
      modal.style.display = "none";
    });
  };

  cancelButton.onclick = () => {
    modal.style.display = "none";
  };

  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

// Função que insere mensagem com texto e/ou imagem
function appendMessageWithImage(text, imageData, className) {
  const chatBox = document.getElementById("chatBox");
  const messageElement = document.createElement("div");
  messageElement.className = `message ${className}`;

  if (text && text.trim() !== "") {
    const textContainer = document.createElement("div");
    textContainer.className = "message-text-container";
    textContainer.innerHTML = `<p class="message-text">${text}</p>`;
    messageElement.appendChild(textContainer);
  }

  if (imageData && imageData.trim() !== "") {
    const imageContainer = document.createElement("div");
    imageContainer.className = "message-image-container";
    imageContainer.innerHTML = `<img src="${imageData}" alt="Imagem enviada" class="message-image">`;
    messageElement.appendChild(imageContainer);
  }

  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Carregar área do chatbot
function loadChatForConversation(conversationId) {
  const chatBox = document.getElementById("chatBox");
  chatBox.innerHTML = "";
  clearImagePreview(); // Limpa o preview ao carregar uma nova conversa

  fetch(`/api/conversations/${conversationId}`)
    .then((res) => res.json())
    .then((messages) => {
      messages.forEach((msg) => {
        const messageClass = msg.image_data
          ? msg.sender === "user"
            ? "user_image"
            : "bot_image"
          : msg.sender === "user"
          ? "user_message"
          : "bot_message";

        if (msg.sender === "bot" && !msg.image_data) {
          // Convertemos Markdown da Gemini para HTML
          const html = marked.parse(msg.text);
          appendMessageWithImage(html, null, "bot_message");
        } else {
          appendMessageWithImage(msg.text, msg.image_data, messageClass);
        }
      });
    });
}

// Função de mandar mensagem como usuário (REESTRUTURADA)
async function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  const imageFile = document.getElementById("imageInput").files[0];

  // Verifica se há texto, imagem de upload ou imagem colada
  if (message === "" && !imageFile && !base64ImageFromPaste) {
    return; // Não envia se não houver nada
  }

  // Exibe a mensagem de texto do usuário no chat
  if (message !== "") {
    appendMessage(message, "user_message");
  }

  // Exibe a imagem do usuário no chat (se houver, seja de upload ou colada)
  if (imageFile) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64ImageFromFile = reader.result;
      appendMessageWithImage(
        "", // O texto da mensagem pode ser vazio se for apenas imagem
        base64ImageFromFile,
        "user_image"
      );
      // Envia os dados após a imagem do arquivo ser carregada
      sendData(message, base64ImageFromFile);
    };
    reader.readAsDataURL(imageFile);
  } else if (base64ImageFromPaste) {
    appendMessageWithImage(
      "", // O texto da mensagem pode ser vazio se for apenas imagem
      base64ImageFromPaste,
      "user_image"
    );
    // Envia os dados imediatamente se for imagem colada
    sendData(message, base64ImageFromPaste);
  } else {
    // Se não houver imagem, envia apenas o texto
    sendData(message, null);
  }

  // Limpa o input de texto e o preview da imagem
  input.value = "";
  clearImagePreview();
}

// Função auxiliar para enviar dados para a API (REESTRUTURADA)
async function sendData(message, imageData) {
  const dataToSend = { message: message, conversation_id: currentChatId };
  if (imageData) {
    dataToSend.image = imageData; // Renomeado para image_data para corresponder ao backend
  }

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    appendMessage(data.response, "bot_message", data.bot_message_id); // Exibe a resposta do bot
    if (!currentChatId && data.conversation_id) {
      currentChatId = data.conversation_id;
      loadConversationHistory(); // Recarrega o histórico para atualizar o título se for a primeira mensagem
    }
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    appendMessage(
      "Desculpe, ocorreu um erro ao processar sua solicitação.",
      "bot_message"
    );
  }
}

// Função de exibir texto no chat (mantida)
function appendMessage(text, className) {
  const chatBox = document.getElementById("chatBox");
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${className}`;

  // Converte Markdown para HTML se for resposta do bot
  if (className === "bot_message") {
    const htmlContent = marked.parse(text);
    msgDiv.innerHTML = `<div class="message-text">${htmlContent}</div>`;
  } else {
    msgDiv.innerHTML = `<p class="message-text">${text}</p>`;
  }

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Envio com Enter (mantido)
document.getElementById("userInput").addEventListener("keyup", (e) => {
  if (e.key === "Enter") sendMessage();
});
