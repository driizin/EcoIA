# EcoIA
Olá! Este é um projeto de um chatbot da ecologia por nome EcoIA que foi desenvolvido pelos alunos do IF Baiano - Campus Guanambi.<br>
São eles: 

| Adriel Lima                                                                                   | Luiz Eduardo Lopes                                                                                 | Vinícius Morais                                                                                 |
| :---------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------: |
| <a href="https://www.instagram.com/wrttdriel/"><img src="https://github.com/user-attachments/assets/45e6c560-ff1b-4bd7-9ea0-2ec6b8cfc48a" width="150" height="150"></a> | <a href="https://www.instagram.com/luyzx_05/"><img src="https://github.com/user-attachments/assets/2492ec2f-3dd4-4b91-aede-0c1dbc602695" width="150" height="150"></a> | <a href="https://www.instagram.com/wtfvinaa/"><img src="https://github.com/user-attachments/assets/ed14cfb8-6721-43e9-a474-da1c94e16ee5" width="150" height="150"></a> |

---


## Instruções para Rodar o Projeto

Para configurar e rodar o chatbot EcoIA no seu ambiente local, siga os passos abaixo.

### Pré-requisitos

Certifique-se de ter os seguintes softwares instalados antes de iniciar:

* **Python 3.12**: [Baixe aqui](https://www.python.org/downloads/release/python-3120/)
* **VS Code**: [Baixe aqui](https://code.visualstudio.com/download)
* **XAMPP**: [Baixe aqui](https://www.apachefriends.org/pt_br/download.html)
* **MySQL Workbench 8.0 CE**: [Baixe aqui](https://dev.mysql.com/downloads/workbench/)
* **Conta Google com API Key para o Gemini**: [Obtenha aqui](https://aistudio.google.com/apikey)

### Configuração do Ambiente

1.  **Baixe e Abra o Projeto:**
    * Clone ou baixe o repositório do GitHub para o seu computador.
    * Caso **BAIXE**, recomendamos renomear a pasta para `chatbot`.
    * Para abrir o projeto no VS Code, selecione a pasta `chatbot` e clique com o botão direito. Vá em "Mostrar mais opções" e depois em "Abrir com Code".<br>
        ![Image of folder selection in VS Code](https://github.com/user-attachments/assets/637e19b7-95ef-4f4e-9f2f-cf1bfa7040f7)<br>
        ![Image of "Open with Code" option](https://github.com/user-attachments/assets/47960288-5148-40be-97ce-df01809d1980)<br>
    * Ao abrir, confirme a confiança nos autores da pasta, se solicitado:<br>
        ![Image of trust prompt in VS Code](https://github.com/user-attachments/assets/bc4daeb9-b84f-4ada-837a-51215a025efd)<br><br>
    * Caso **CLONE**, crie uma pasta para o nome `chatbot` para depois fazer os processos ensinados anteriormente de "Abrir com Code".<br>
    *  No terminal, que tem a seguir um tutorial de como abrir, com ele aberto cole o seguinte código antes de fazer qualquer coisa:
         ```bash
         git clone https://github.com/driizin/EcoIA.git
         ```
         ![image](https://github.com/user-attachments/assets/fb5c95e6-b6ff-4d6b-b434-1421a9de540d)


2.  **Abra o Terminal no VS Code:**
    * No VS Code, abra o arquivo `main.py` no lado esquerdo.<br>
        ![Image of main.py in VS Code sidebar](https://github.com/user-attachments/assets/13c42d7c-13d5-41fd-ae80-75f5c20af962)
    * Vá na parte superior do aplicativo e selecione **Terminal > Novo Terminal**.<br>
        ![Image of Terminal menu in VS Code](https://github.com/user-attachments/assets/27569e8b-1ac0-4e7a-b600-ad85890bafc4)<br>
        ![Image of New Terminal option](https://github.com/user-attachments/assets/c76451a6-8252-4808-91ad-cd31fe61fe9b)<br>
        ![Image of terminal type selection in VS Code](https://github.com/user-attachments/assets/06a7a9cc-b192-437e-b4db-abee67938afe)<br>

3.  **Crie e Ative o Ambiente Virtual:**
    * Para criar um ambiente virtual chamado `EcoIA` (recomendado para isolar as dependências do projeto), execute:
        ```bash
        py -3.12 -m venv EcoIA
        ```
        ![Image of venv creation command](https://github.com/user-attachments/assets/81281276-7d51-4ec7-96ce-03a051240a5d)
    * Ative o ambiente virtual. Você deve ver `(EcoIA)` no início da linha de comando. **Os comandos de ativação variam de acordo com o sistema operacional:**
        * **No Windows (CMD/PowerShell):**
            ```bash
            .\EcoIA\Scripts\activate
            ```
            ![Image of Windows virtual environment activation](https://github.com/user-attachments/assets/64667b8a-891e-4f9c-a377-1f481c45ea4b)
        * **No Linux / macOS (Bash/Zsh):**
            ```bash
            source EcoIA/Scripts/activate
            ```
            ![Image of Linux and macOS virtual environment activation](https://github.com/user-attachments/assets/32f85aab-1663-4b0e-8e88-81cfef0101d3)

    * Verifique se o VS Code está usando o interpretador Python correto (Python 3.12 do ambiente `EcoIA`). Ele aparece no canto inferior direito. Se não estiver, clique nele e selecione "Python 3.12.0 ('EcoIA':venv)".<br>
        ![Image of Python interpreter selection in VS Code](https://github.com/user-attachments/assets/f20aa7ae-2743-4363-b120-db727df2577b)<br>
        ![Image of Python versions list](https://github.com/user-attachments/assets/e6c3e9ae-e026-47d5-a5c5-4f691a7ccefd)

4.  **Instale as Dependências do Projeto:**
    Com o ambiente virtual **`EcoIA`** ativado, instale todas as bibliotecas Python necessárias para o projeto. O arquivo `requirements.txt` garante que todas as dependências (incluindo os modelos de linguagem do SpaCy) sejam instaladas nas versões exatas, assegurando a compatibilidade e a funcionalidade do chatbot.

    No terminal, execute:
    ```bash
    pip install -r requirements.txt
    ```

### Configuração do Banco de Dados MySQL

1.  **Inicie o Servidor MySQL via XAMPP:**
    * Abra o XAMPP Control Panel.<br>
        ![Image of XAMPP Control Panel](https://github.com/user-attachments/assets/ba04212d-18c2-450e-b7b9-505ba6b9ca67)<br>
    * Clique no botão **Start** ao lado de "MySQL" para iniciar o serviço do banco de dados.<br>
        ![Image of MySQL Start button in XAMPP](https://github.com/user-attachments/assets/66e2e501-3b38-49ad-982b-fbd4f8fb1f64)

2.  **Crie o Banco de Dados com o MySQL Workbench:**
    * Na pasta do seu projeto `chatbot`, localize e abra a pasta `sgbd`.<br>
        ![Image of sgbd folder](https://github.com/user-attachments/assets/3813ce80-16f7-4950-af6f-e63f2badebc2)<br>
    * Abra o arquivo `chatbot.sql` com o MySQL Workbench.<br>
        ![Image of chatbot.sql in folder](https://github.com/user-attachments/assets/72d4d829-8bcd-4c6d-b27e-f66834003d75)<br>
        ![Image of MySQL Workbench interface](https://github.com/user-attachments/assets/ff19ea6a-e38f-4ccc-9e86-0ea85a75ac90)<br>
    * Dentro do MySQL Workbench, execute o script SQL clicando no ícone de "raiozinho" (destacado em azul).<br>
        ![Image of execute SQL button in MySQL Workbench](https://github.com/user-attachments/assets/edad63cc-f7eb-41aa-b153-93f0e6aef44b)<br>
    * A execução bem-sucedida será confirmada na seção "Output" na parte inferior, com símbolos verdes.<br>
        ![Image of successful SQL execution output](https://github.com/user-attachments/assets/f04a2976-5111-4aed-91a8-aa029ef5dd52)

### Configuração da API do Google Gemini

1.  **Obtenha sua Chave de API:**
    * Acesse o [Google AI Studio](https://aistudio.google.com/apikey) e clique em "Criar chave de API".<br>
        ![Image of Google AI Studio API key creation](https://github.com/user-attachments/assets/890ec6fd-e582-4e34-b196-7befa2c661d7)<br>
    * No campo "Pesquisar projetos do Google Cloud", selecione o projeto do Gemini API.<br>
        ![Image of Gemini API project selection](https://github.com/user-attachments/assets/5e34cc08-1935-427e-9c6c-872003091238)<br>
    * Sua chave de API aparecerá. Copie-a.

    <br>**OBSERVAÇÃO IMPORTANTE:** ⚠️ **TENHA MUITO CUIDADO COM ESSA CHAVE!** Se alguém obtiver sua chave de API, poderá ter acesso à sua conta Google e potencialmente a informações confidenciais, além de gerar custos indevidos. Mantenha-a em segurança! ⚠️<br><br>

2.  **Configure a Variável de Ambiente:**
    * Pesquise no Windows por "Variáveis de Ambiente" (ou "Editar as variáveis de ambiente do sistema").<br>
        ![Image of Windows search for Environment Variables](https://github.com/user-attachments/assets/04f78028-5b99-4f53-90eb-c8c3cc9470c0)<br>
    * Na janela de Propriedades do Sistema, clique em "Variáveis de Ambiente...".<br>
        ![Image of Environment Variables button](https://github.com/user-attachments/assets/193d2545-f4ad-421e-9823-77ab66222ea5)<br>
    * Na seção "Variáveis de usuário" (ou "Variáveis do sistema", se preferir que seja para todos os usuários), clique em "Novo...".<br>
        ![Image of New Environment Variable button](https://github.com/user-attachments/assets/d56145d2-a561-4548-b96a-a974c98e23b9)<br>
    * No campo "Nome da variável", insira: `GOOGLE_GEMINI_API_KEY`
    * No campo "Valor da variável", cole sua chave de API (sem aspas).
    * Clique em OK em todas as janelas para salvar as alterações.
    * **Reinicie o computador** para que a nova variável de ambiente seja reconhecida pelo sistema.

### Rodando o Chatbot

1.  **Inicie o Servidor do Chatbot:**
    * Com todas as configurações anteriores feitas e seu ambiente virtual `EcoIA` ativado no terminal do VS Code:
    * Aperte no botão de "Play" para rodar o arquivo.<br>
        ![Image of VS Code Play button](https://github.com/user-attachments/assets/1142e0ab-cdba-470d-b59b-62154bd3d1e8)

2.  **Acesse o Chatbot no Navegador:**
    * Após iniciar o servidor, o terminal indicará o endereço local onde o chatbot está rodando. Geralmente, será:
        http://127.0.0.1:5000
        ![Image of chatbot running on localhost](https://github.com/user-attachments/assets/a095dad3-d04c-4729-ba70-02030db6ede7)<br>
    * Abra seu navegador e acesse esse endereço.

### Demonstração do Chatbot

Assista a uma breve demonstração do EcoIA em ação:

![Demonstração do Chatbot EcoIA](https://github.com/driizin/EcoIA/blob/main/static/assets/gif/chatbot.gif?raw=true)

---

### 11. Aproveite e teste o nosso chatbot EcoIA!!!<br>
<br>![user-campaign-reward-desc_15-20190620_20054103](https://github.com/user-attachments/assets/39459ec7-5425-41df-9464-6584424d2a4e)
