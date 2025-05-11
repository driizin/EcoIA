let currentChatId = null;

document.addEventListener("DOMContentLoaded", () => {
  appendMessage(
    "Olá meu caro usuário! Eu sou o EcoIA, a IA que te auxiliará em assuntos sobre ecologia. Qual é a sua dúvida?",
    "bot_message"
  );
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

          // Mostra a prévia
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            imagePreviewContainer.innerHTML = `<img src="${canvas.toDataURL(
              "image/png"
            )}" alt="Prévia da imagem">`;
          };
          img.src = base64; // Use a string base64 do FileReader para a imagem de prévia

          // Armazene a string base64 para enviar
          base64ImageFromPaste = base64;
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
    imagePreviewContainer.innerHTML = `<img src="${e.target.result}" alt="Prévia da imagem">`;
  };
  reader.readAsDataURL(file);
}

//Função de carregar conversa salva
function loadConversationHistory() {
  fetch("/api/history")
    .then((res) => res.json())
    .then((history) => {
      document.getElementById("historyBox").innerHTML = "";
      history.forEach(addConversationToHistory);
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
  let base64ImageFromPaste = null;

  const sendData = () => {
    const dataToSend = { message: message, conversation_id: currentChatId };
    if (base64ImageFromFile) {
      dataToSend.image = base64ImageFromFile;
      console.log(
        "Base64 (Upload) (Início): ",
        base64ImageFromFile.substring(0, 100) + "..."
      );
      console.log("Base64 (Upload) (Fim): ", base64ImageFromFile.slice(-100));
      console.log("Tamanho Base64 (Upload): ", base64ImageFromFile.length);
    } else if (base64ImageFromPaste) {
      dataToSend.image = base64ImageFromPaste;
      console.log(
        "Base64 (Paste) (Início): ",
        base64ImageFromPaste.substring(0, 100) + "..."
      );
      console.log("Base64 (Paste) (Fim): ", base64ImageFromPaste.slice(-100));
      console.log("Tamanho Base64 (Paste): ", base64ImageFromPaste.length);
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
