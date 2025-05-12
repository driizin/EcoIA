let currentChatId = null;
let toggleMenuBtn;
let historyArea;
let base64ImageFromPaste = null;


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

  const imageInput = document.getElementById("imageInput");
  const imagePreviewContainer = document.getElementById(
    "imagePreviewContainer"
  );
  const userInput = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox"); // Obtém a chatBox aqui
  const imageUploadIcon = document.querySelector(".image-upload-icon");

  if (imageUploadIcon) {
    imageUploadIcon.addEventListener("click", () => {
      imageInput.click();
    });
  }

  imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      displayImagePreview(file);
    }
  });

  userInput.addEventListener("paste", (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData)
      .items;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();

        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target.result;

          // Mostra a prévia com botão de exclusão (usando canvas)
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const imageUrl = canvas.toDataURL("image/png");

            const previewDiv = document.createElement("div");
            previewDiv.style.position = "relative";
            previewDiv.style.display = "inline-block";
            previewDiv.style.marginRight = "5px";

            const previewImg = document.createElement("img");
            previewImg.src = imageUrl;
            previewImg.alt = "Prévia da imagem";
            previewImg.style.maxWidth = "70px";
            previewImg.style.height = "auto";

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
            removeButton.onclick = function () {
              previewDiv.remove();
              base64ImageFromPaste = null; // Limpa corretamente ao remover
            };

            previewDiv.appendChild(previewImg);
            previewDiv.appendChild(removeButton);
            imagePreviewContainer.innerHTML = '';
            imagePreviewContainer.appendChild(previewDiv);

            // Armazene a string base64 para enviar (a do canvas)
            base64ImageFromPaste = imageUrl;
          };
          img.src = base64;
        };
        reader.readAsDataURL(blob);

        event.preventDefault();
        break;
      }
    }
  });
});

function displayImagePreview(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const imageUrl = e.target.result;
    const previewDiv = document.createElement("div");
    previewDiv.style.position = "relative";
    previewDiv.style.display = "inline-block";
    previewDiv.style.marginRight = "5px"; // Adiciona um pequeno espaço entre as imagens

    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = "Prévia da imagem";
    img.style.maxWidth = "50px"; // Ajuste o tamanho máximo da prévia conforme necessário
    img.style.height = "auto";

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
    removeButton.onclick = function () {
      previewDiv.remove();
      document.getElementById("imageInput").value = "";
      base64ImageFromPaste = null;
    };

    previewDiv.appendChild(img);
    previewDiv.appendChild(removeButton);
    imagePreviewContainer.appendChild(previewDiv);
  };
  reader.readAsDataURL(file);
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
}

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
      alert("Por favor, insira um novo título.");
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

// Função de mandar mensagem como usuário
function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  const imageFile = document.getElementById("imageInput").files[0];
  const imagePreviewSrc = document.querySelector(
    "#imagePreviewContainer img"
  )?.src;

  let base64ImageFromFile = null;

  const sendData = () => {
    const dataToSend = { message: message, conversation_id: currentChatId };
    if (base64ImageFromFile) {
      dataToSend.image = base64ImageFromFile;
      console.log("Enviando (Upload): ", {
        message: dataToSend.message,
        conversation_id: dataToSend.conversation_id,
        image: dataToSend.image
          ? dataToSend.image.substring(0, 50) + "..."
          : null,
      });
    } else if (base64ImageFromPaste) {
      dataToSend.image = base64ImageFromPaste;
      console.log("Enviando (Paste): ", {
        message: dataToSend.message,
        conversation_id: dataToSend.conversation_id,
        image: dataToSend.image
          ? dataToSend.image.substring(0, 50) + "..."
          : null,
      });
    } else {
      console.log("Enviando (Texto apenas): ", {
        message: dataToSend.message,
        conversation_id: dataToSend.conversation_id,
      });
    }

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    })
      .then((res) => res.json())
      .then((data) => {
        appendMessage(data.response, "bot_message");
        if (!currentChatId && data.conversation_id) {
          currentChatId = data.conversation_id;
          loadConversationHistory();
        }
      });
  };

  if (message === "" && !imageFile && !imagePreviewSrc) return;

  if (message !== "") {
    appendMessage(message, "user_message");
  }

  if (imageFile) {
    const reader = new FileReader();
    reader.onloadend = () => {
      base64ImageFromFile = reader.result;
      appendImageMessage(
        `<img src="${base64ImageFromFile}" alt="Imagem enviada" class="message-image">`,
        "user_image"
      );
      document.getElementById("imageInput").value = "";
      sendData();
    };
    reader.readAsDataURL(imageFile);
  } else if (imagePreviewSrc && imagePreviewSrc.startsWith("data:image/")) {
    appendImageMessage(
      `<img src="${base64ImageFromPaste}" alt="Imagem colada" class="message-image">`,
      "user_image"
    );
    document.getElementById("imageInput").value = "";
    sendData();
  } else {
    sendData();
  }

  // Sempre limpa os campos
  input.value = "";
  document.getElementById("imagePreviewContainer").innerHTML = "";
}

// Função de exibir imagem no chat
function appendImageMessage(imageHTML, className) {
  const chatBox = document.getElementById("chatBox");
  const messageElement = document.createElement("div");
  messageElement.className = `message ${className}`;

  const imageContainer = document.createElement("div");
  imageContainer.className = "message-image-container";
  imageContainer.innerHTML = imageHTML;

  messageElement.appendChild(imageContainer);
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Função de exibir texto no chat
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

// Envio com Enter
document.getElementById("userInput").addEventListener("keyup", (e) => {
  if (e.key === "Enter") sendMessage();
});
