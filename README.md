# EcoIA
Olá! Este é um projeto de um chatbot da ecologia por nome EcoIA que foi desenvolvido pelos alunos do IF Baiano - Campus Guanambi.<br>
São eles: 

|                                                                                                |                                                                                                |                                                                                                |
| :---------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------: |
| <a href="https://www.instagram.com/wrttdriel/"><img src="https://github.com/user-attachments/assets/45e6c560-ff1b-4bd7-9ea0-2ec6b8cfc48a" width="150" height="150"></a><br>Adriel Lima | <a href="https://www.instagram.com/luyzx_05/"><img src="https://github.com/user-attachments/assets/2492ec2f-3dd4-4b91-aede-0c1dbc602695" width="150" height="150"></a><br>Luiz Eduardo Lopes | <a href="https://www.instagram.com/wtfvinaa/"><img src="https://github.com/user-attachments/assets/ed14cfb8-6721-43e9-a474-da1c94e16ee5" width="150" height="150"></a><br>Vinícius Morais |
# Instruções
Para funcionar o chatbot, precisa rodar o arquivo main.py. Mas antes disso, precisa baixar o [Python 3.12](https://www.python.org/downloads/release/python-3120/), o [VS Code](https://code.visualstudio.com/download), o [XAMPP](https://www.apachefriends.org/pt_br/download.html), o [MySQL Workbench 8.0 CE](https://dev.mysql.com/downloads/workbench/), ter o [API key do Google](https://aistudio.google.com/apikey) e criar o ambiente virtual dentro da pasta que foi instalada esse arquivos do GitHub. E por recomendação, renomeie a pasta para o nome chatbot.
1. Para abrir e rodar projeto, selecione a pasta
![image](https://github.com/user-attachments/assets/637e19b7-95ef-4f4e-9f2f-cf1bfa7040f7)<br>
E com o botão direito, vai em Mostrar mais opções e logo após, Abrir com Code
![image](https://github.com/user-attachments/assets/47960288-5148-40be-97ce-df01809d1980)<br>
2. Ao abrir a pasta com VS Code, confirme de confiar nesse autor da pasta, como na imagem:
   ![image](https://github.com/user-attachments/assets/bc4daeb9-b84f-4ada-837a-51215a025efd)
3. Depois abra o arquivo main.py, no lado esquerdo<br>
   ![image](https://github.com/user-attachments/assets/13c42d7c-13d5-41fd-ae80-75f5c20af962)
2. Logo após, vai na parte superior do aplicativo do VS Code e vai na função Terminal
![image](https://github.com/user-attachments/assets/27569e8b-1ac0-4e7a-b600-ad85890bafc4)
E depois em Novo Terminal
![image](https://github.com/user-attachments/assets/c76451a6-8252-4808-91ad-cd31fe61fe9b)<br>
Muito provavelmente vai estar num terminal PowerShell
![image](https://github.com/user-attachments/assets/d2105d40-9add-4c45-9f43-ea6c020c6d95)<br>
Recomendação nossa de usar o Command Propmt (cmd), e pode fazer isso apertando no ˇ, ao lado do powershell
![image](https://github.com/user-attachments/assets/06a7a9cc-b192-437e-b4db-abee67938afe)<br>
Apertando aparece isso:<br>
![image](https://github.com/user-attachments/assets/81855581-1b0f-4807-8170-25d60e18cd98)<br>
E selecione o Command Prompt (cmd)
![image](https://github.com/user-attachments/assets/8ff96cf7-a273-42d0-8bbc-1594054b3eb1)
4. Para criar o ambiente virtual, use o código: py -3.12 -m venv EcoIA
![image](https://github.com/user-attachments/assets/81281276-7d51-4ec7-96ce-03a051240a5d)
5. Se no terminal do VS Code não estiver o (EcoIA) antes de um link onde está o projeto
![image](https://github.com/user-attachments/assets/8ff96cf7-a273-42d0-8bbc-1594054b3eb1)<br>
ative usando esse comando: .\EcoIA\Scripts\activate
![image](https://github.com/user-attachments/assets/64667b8a-891e-4f9c-a377-1f481c45ea4b)
7. Verifique se está rodando na versão do Python 3.12 na parte inferior direito do VS Code que está destacado num quadrado mais claro:
![image](https://github.com/user-attachments/assets/f20aa7ae-2743-4363-b120-db727df2577b)
Caso não estiver, aperte nele e vai aparecer as versões do python instalados
![image](https://github.com/user-attachments/assets/e6c3e9ae-e026-47d5-a5c5-4f691a7ccefd)<br>
E selecione esse Python 3.12.0('EcoIA':venv)
7. E para reconhecer essas bibliotecas do main.py:
![image](https://github.com/user-attachments/assets/39d29d39-85f3-4637-96a3-46f4fcadc654)<br>
Use esses códigos em sequência no terminal:<br>
pip install flask <br>
pip install chatterbot <br>
pip install google.generativeai <br>
pip install markdown<br>
pip install bleach<br>
pip install mysql <br>
pip install mysql-connector-python <br>
python -m spacy download pt_core_news_sm <br>
python -m spacy download en_core_web_sm
9. Para funcionar, precisa criar o banco de dados. Então com o Xampp aberto<br>
![image](https://github.com/user-attachments/assets/ba04212d-18c2-450e-b7b9-505ba6b9ca67)<br>
Aperte o botão Start do mysql para que o server dele funcione, como na imagem:<br>
![image](https://github.com/user-attachments/assets/66e2e501-3b38-49ad-982b-fbd4f8fb1f64)<br>
Logo após, na pasta do chatbot, dentro dela procure a pasta sgbd
![image](https://github.com/user-attachments/assets/3813ce80-16f7-4950-af6f-e63f2badebc2)<br>
Dentro dessa pasta abra o arquivo chatbot.sql com o MySQL Workbench:
![image](https://github.com/user-attachments/assets/72d4d829-8bcd-4c6d-b27e-f66834003d75)<br>
![image](https://github.com/user-attachments/assets/ff19ea6a-e38f-4ccc-9e86-0ea85a75ac90)<br>
Dentro dela, execute o arquivo com o símbolo do raiozinho que está destacado em um quadrado azul:
![image](https://github.com/user-attachments/assets/edad63cc-f7eb-41aa-b153-93f0e6aef44b)<br>
e vai funcionar olhando no Output, no lado inferior mostrando antes com uns símbolos verdes:
![image](https://github.com/user-attachments/assets/f04a2976-5111-4aed-91a8-aa029ef5dd52)
9. Depois pegue sua API key no site e aperte no botão Criar chave de API
![image](https://github.com/user-attachments/assets/890ec6fd-e582-4e34-b196-7befa2c661d7)<br>
Vai no Pesquisar projetos do Google Cloud e selecione o Gemini API:
![image](https://github.com/user-attachments/assets/5e34cc08-1935-427e-9c6c-872003091238)<br>
A chave de API aparecerá em baixo com opção de copiar.<br>
Obs.: ⚠️ TENHA MUITO CUIDADO COM ESSA CHAVE POIS SE ALGUÉM OBTIVER ELA, TEM ACESSO A SUA CONTA GOOGLE, PODENDO ACESSAR NOS SEUS ASSUNTOS CONFIDENCIAIS E PODENDO ROUBÁ-LAS. ⚠️<br>
Com a chave copiada, pesquise no Windows por Variáveis de Ambiente
![image](https://github.com/user-attachments/assets/04f78028-5b99-4f53-90eb-c8c3cc9470c0)
Abra ela e depois de abrir, selecione Variáveis de Ambiente<br>
![image](https://github.com/user-attachments/assets/193d2545-f4ad-421e-9823-77ab66222ea5)<br>
Nas Variáveis de usuário para (user) e Variáveis do sistema, aperte no botão Novo
![image](https://github.com/user-attachments/assets/d56145d2-a561-4548-b96a-a974c98e23b9)<br>
No Nome da variável coloque: GOOGLE_GEMINI_API_KEY <br>
E no Valor da variável coloque: "sua chave de API" <br>
Logo após reinicie o computador para salvar essas variáveis.
9. Depois é só rodar apertando no sinal de play
![image](https://github.com/user-attachments/assets/1142e0ab-cdba-470d-b59b-62154bd3d1e8)<br>
e dará este link para acessar: http://127.0.0.1:5000
![image](https://github.com/user-attachments/assets/a095dad3-d04c-4729-ba70-02030db6ede7)
11. Aproveite e teste o nosso chatbot EcoIA e também veja o arquivo intrucoes.txt para nos ajudar a adicionar conteúdos sobre ecologia.<br>
<br><br><br>![user-campaign-reward-desc_15-20190620_20054103](https://github.com/user-attachments/assets/39459ec7-5425-41df-9464-6584424d2a4e)

   
