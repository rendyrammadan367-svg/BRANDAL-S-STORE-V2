const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
  Events
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// ================== CONFIG ==================
const CATEGORY_ID = "1465451776479203421"; // GANTI
const ADMIN_ROLE_ID = "1465638029023776929"; // GANTI
const TICKET_CHANNEL_ID = "1465598842295685292"; // GANTI
// ============================================

let ticketCount = 0;

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot online sebagai ${client.user.tag}`);
});

// ================== PANEL TICKET ==================
client.on(Events.ClientReady, async () => {
  const channel = await client.channels.fetch(TICKET_CHANNEL_ID);

  const embed = new EmbedBuilder()
    .setColor("#ff4d4d")
    .setTitle("🎫 OPEN TICKET")
    .setDescription("Silahkan sampaikan keperluan mu")
    .setImage("https://cdn.discordapp.com/attachments/1468055260567179345/1468056778100048044/3dgifmaker09091.gif");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("open_ticket")
      .setLabel("Buat Ticket")
      .setStyle(ButtonStyle.Success)
      .setEmoji("🎟️")
  );

  await channel.send({ embeds: [embed], components: [row] });
});

// ================== INTERACTION ==================
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  // ===== OPEN TICKET =====
  if (interaction.customId === "open_ticket") {
    const existing = interaction.guild.channels.cache.find(
      c => c.name.includes(interaction.user.id)
    );

    if (existing) {
      return interaction.reply({
        content: "❌ Kamu masih punya ticket yang aktif",
        ephemeral: true
      });
    }

    ticketCount++;

    const ticketChannel = await interaction.guild.channels.create({
      name: `ticket-${ticketCount}`,
      type: ChannelType.GuildText,
      parent: CATEGORY_ID,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages
          ]
        },
        {
          id: ADMIN_ROLE_ID,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages
          ]
        }
      ]
    });

    const closeRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("Tutup Ticket")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("🔒")
    );

    await ticketChannel.send({
      content: `<@${interaction.user.id}> <@&${ADMIN_ROLE_ID}>`,
      embeds: [
        new EmbedBuilder()
          .setColor("#ff4d4d")
          .setDescription("Silahkan sampaikan keperluan mu")
      ],
      components: [closeRow]
    });

    await interaction.reply({
      content: `✅ Ticket kamu dibuat: ${ticketChannel}`,
      ephemeral: true
    });
  }

  // ===== CLOSE TICKET =====
  if (interaction.customId === "close_ticket") {
    await interaction.reply({
      content: "⏳ Ticket akan ditutup...",
      ephemeral: true
    });

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 3000);
  }
});

// ================== LOGIN ==================
client.login(process.env.TOKEN);
