drop database if exists chatbot;
create database chatbot;
use chatbot;

create table conversations (
    id int primary key auto_increment,
    title varchar(255) default 'Nova Conversa',
    created_at timestamp default current_timestamp
);

create table messages (
    id int primary key auto_increment,
    conversation_id int,
    text text,
    image_data longtext, 
    sender varchar(255),
    created_at timestamp default current_timestamp,
    foreign key (conversation_id) references conversations(id)
);