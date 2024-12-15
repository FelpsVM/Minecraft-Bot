# Bot de Minecraft com funcionalidades de mineração, navegação e interação

Este projeto é um bot para o Minecraft que utiliza a biblioteca `mineflayer` para interagir com o jogo. O bot pode executar uma série de comandos para realizar ações como mineração, navegação para coordenadas específicas, interação com o inventário e muito mais.

## Funcionalidades

- **Mineração**: O bot pode minerar blocos específicos em quantidade determinada.
- **Navegação**: O bot pode se mover para coordenadas específicas ou para a posição de um jogador.
- **Inventário**: O bot pode listar os itens em seu inventário ou descartá-los.
- **Comandos de chat**: O bot responde a comandos no chat do Minecraft para executar essas ações.

## Requisitos

- **Node.js**: O projeto foi desenvolvido usando Node.js. Certifique-se de ter a versão mais recente do Node.js instalada em seu sistema.
- **Dependências**: O bot depende das bibliotecas `mineflayer` e `mineflayer-pathfinder`. Você pode instalar essas dependências executando o comando de instalação.

## Instalação

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu_usuario/bot-minecraft.git
   cd bot-minecraft
   ```
2. **Instale as dependências: No diretório do projeto, execute o seguinte comando para instalar as dependências necessárias**:

```bash
npm install
```

3. **Crie o arquivo de configuração Infs.json: O bot espera que um arquivo de configuração chamado Infs.json esteja presente no mesmo diretório do script. Este arquivo deve conter as seguintes informações**:
```bash
{
  "host": "endereco_do_servidor", 
  "port": 25565, 
  "username": "nome_de_usuario_do_bot"
}
```
**Exemplo**:
```bash
{
  "host": "localhost",
  "port": 25565,
  "username": "BotMinerador"
}
```

