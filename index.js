const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Channel]
});

/* ================= GANTI INI ================= */
const CATEGORY_ID = "1465451776479203421";
const ADMIN_ROLE_ID = "1465638029023776929";
const PANEL_CHANNEL_ID = "1465598842295685292";
const GIF_URL = "https://tenor.com/u2zDo2Cn1hC.gif"; // boleh kosong
/* ============================================= */

let ticketNumber = 0;

client.once("ready", async () => {
  console.log(`🔥 Bot online: ${client.user.tag}`);

  const panel = await client.channels.fetch(PANEL_CHANNEL_ID).catch(() => null);
  if (!panel) return;

  const embed = new EmbedBuilder()
    .setColor(0x8b5cf6)
    .setTitle("🎫 BRANDALS STORE")
    .setDescription(
      "Klik tombol di bawah buat buka ticket.\n\n" +
      "**Silahkan sampaikan keperluan mu**"
    )
    .setImage(GIF_URL || null);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("open_ticket")
      .setLabel("🎟️ Buka Ticket")
      .setStyle(ButtonStyle.Primary)
  );

  await panel.send({ embeds: [embed], components: [row] });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  // === OPEN TICKET ===
  if (interaction.customId === "open_ticket") {
    const exists = interaction.guild.channels.cache.find(
      c => c.topic === interaction.user.id
    );

    if (exists) {
      return interaction.reply({
        content: "❌ Kamu masih punya ticket aktif.",
        ephemeral: true
      });
    }

    ticketNumber++;

    const channel = await interaction.guild.channels.create({
      name: `ticket-${ticketNumber}`,
      type: ChannelType.GuildText,
      parent: CATEGORY_ID,
      topic: interaction.user.id,
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
        .setLabel("🔒 Tutup Ticket")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `<@&${ADMIN_ROLE_ID}>`,
      embeds: [
        new EmbedBuilder()
          .setColor(0x22c55e)
          .setDescription("Silahkan sampaikan keperluan mu.")
      ],
      components: [closeRow]
    });

    return interaction.reply({
      content: `✅ Ticket berhasil dibuat: ${channel}`,
      ephemeral: true
    });
  }

  // === CLOSE TICKET ===
  if (interaction.customId === "close_ticket") {
    await interaction.reply({
      content: "🔒 Ticket akan ditutup...",
      ephemeral: true
    });

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 3000);
  }
});

client.login(process.env.TOKEN);
