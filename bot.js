const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const fs = require('fs');

// Carregar configurações do arquivo JSON
let config;
try {
    config = JSON.parse(fs.readFileSync('Infs.json', 'utf8'));
} catch (err) {
    console.error('Erro ao ler o arquivo Infs.json:', err);
    process.exit(1);
}

// Criar o bot com as configurações carregadas
const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
});

// Adicionar o plugin pathfinder ao bot
bot.loadPlugin(pathfinder);

// Evento quando o bot estiver pronto
bot.on('spawn', () => {
    console.log('Bot conectado!');
    const defaultMovements = new Movements(bot, require('minecraft-data')(bot.version));
    bot.pathfinder.setMovements(defaultMovements);
});

// Variáveis para controle de mineração
let mining = false;
let targetBlock = null;
let targetQuantity = 0;
let trackingMob = null; // Mob atualmente sendo rastreado
let lastPosition = null; // Última posição registrada do mob

// Evento para monitorar mensagens no chat
bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    // Comando para encontrar a posição de um bloco
    if (message.startsWith('#pos ')) {
        const blockName = message.slice(5).trim();
        const blockPosition = bot.findBlock({
            matching: block => block.name === blockName,
            maxDistance: 100,
        });

        if (blockPosition) {
            bot.chat(`Bloco encontrado: ${blockName} em (${blockPosition.position.x}, ${blockPosition.position.y}, ${blockPosition.position.z})`);
        } else {
            bot.chat(`Não consegui encontrar o bloco: ${blockName} por perto.`);
        }
    }

    // Comando para minerar um bloco específico
    if (message.startsWith('#mine ')) {
        const args = message.slice(6).trim().split(' ');
        if (args.length !== 2) {
            bot.chat('Uso correto: #mine <bloco> <quantidade>');
            return;
        }

        const blockName = args[0];
        const quantity = parseInt(args[1], 10);

        if (isNaN(quantity) || quantity <= 0) {
            bot.chat('A quantidade deve ser um número positivo.');
            return;
        }

        mining = true;
        targetBlock = blockName;
        targetQuantity = quantity;

        bot.chat(`Iniciando a mineração de ${quantity} ${blockName}(s)...`);
        mineBlock();
    }

    // Comando para cancelar a mineração
    if (message === '#cancel') {
        mining = false;
        targetBlock = null;
        targetQuantity = 0;
        bot.chat('Mineração cancelada.');
    }

    if (message.startsWith('#go ')) {
      const args = message.slice(4).trim().split(' ');
      if (args.length !== 3) {
          bot.chat('Uso correto: #go <x> <y> <z>');
          return;
      }
  
      const player = bot.players[username]?.entity;
      if (!player) {
          bot.chat('Não consegui encontrar o jogador para determinar a posição.');
          return;
      }
  
      const x = parseCoordinate(args[0], player.position.x);
      const y = parseCoordinate(args[1], player.position.y);
      const z = parseCoordinate(args[2], player.position.z);
  
      if (x === null || y === null || z === null) {
          bot.chat('As coordenadas devem ser números ou relativas (~).');
          return;
      }
  
      bot.chat(`Indo para as coordenadas (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})...`);
      goToCoordinates(x, y, z);
  }
  
  function parseCoordinate(coord, current) {
      if (coord.startsWith('~')) {
          const offset = parseFloat(coord.slice(1)) || 0; // Caso "~", o offset será 0
          return current + offset;
      } else if (!isNaN(parseFloat(coord))) {
          return parseFloat(coord);
      }
      return null; // Coordenada inválida
  }
  
  async function goToCoordinates(x, y, z) {
      try {
          await bot.pathfinder.goto(new goals.GoalBlock(x, y, z));
          bot.chat('Cheguei ao destino!');
      } catch (err) {
          bot.chat('Erro ao tentar ir para o destino.');
          console.error(err);
      }
  }

    if (message === '#drop') {
      dropInventory(username);
  }
  
  async function dropInventory(username) {
      const player = bot.players[username]?.entity;
      if (!player) {
          bot.chat('Não consegui encontrar o jogador para determinar a posição.');
          return;
      }
  
      bot.chat('Começando a dropar o inventário...');
      for (const item of bot.inventory.items()) {
          try {
              await bot.tossStack(item);
              bot.setControlState('back', true); // Anda para trás
              await new Promise(resolve => setTimeout(resolve, 500)); // Espera 500ms antes de parar
              bot.setControlState('back', false);
          } catch (err) {
              bot.chat('Erro ao dropar item.');
              console.error(err);
          }
      }
  
      bot.chat('Inventário completamente dropado!');
  }

    // Comando para listar o inventário
if (message === '#inv') {
  const inventory = bot.inventory.items();
  if (inventory.length === 0) {
      bot.chat('Meu inventário está vazio.');
      return;
  }

  let inventoryMessage = 'Meu inventário: ';
  inventory.forEach(item => {
      const durability = item.durabilityUsed ? `(${item.durabilityUsed}/${item.maxDurability})` : '';
      inventoryMessage += `${item.count}x ${item.name}${durability}, `;
  });

  // Remove a vírgula extra no final e manda no chat
  bot.chat(inventoryMessage.slice(0, -2));
}

});

// Função para minerar o bloco
async function mineBlock() {
    while (mining && targetQuantity > 0) {
        const blockPosition = bot.findBlock({
            matching: block => block.name === targetBlock,
            maxDistance: 64,
        });

        if (!mining) {
            bot.chat('Mineração cancelada durante o processo.');
            break;
        }

        if (blockPosition) {
            try {
                await bot.pathfinder.goto(new goals.GoalBlock(blockPosition.position.x, blockPosition.position.y, blockPosition.position.z));
                
                if (!mining) {
                    bot.chat('Mineração cancelada antes de quebrar o bloco.');
                    break;
                }

                await bot.dig(blockPosition);
                targetQuantity--;
                bot.chat(`Minerei um ${targetBlock}. Restam ${targetQuantity} para minerar.`);
            } catch (err) {
                bot.chat('Erro ao tentar minerar. Verifique se há um caminho possível.');
                console.error(err);
                break;
            }
        } else {
            bot.chat(`Não consegui encontrar mais ${targetBlock} por perto.`);
            break;
        }
    }

    if (!mining) {
        bot.chat('Mineração cancelada com sucesso.');
    } else if (targetQuantity === 0) {
        bot.chat(`Mineração de ${targetBlock} concluída!`);
    }

    mining = false;
    targetBlock = null;
    targetQuantity = 0;
}
