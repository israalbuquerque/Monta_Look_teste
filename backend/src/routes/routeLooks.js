import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";

dotenv.config();

const router = express.Router();

// Pool de conexão com o Banco de Dados MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

// Configuração do Multer para armazenamento de fotos enviadas
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `peca_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// =========================================================================
// 1. ROTA: RECOMENDAR LOOKS (Busca por Filtros)
// =========================================================================
router.get("/recomendar", async (req, res) => {
  try {
    const { g, f1, f2, f3 } = req.query;

    if (!g || !f1 || !f2 || !f3) {
      return res.status(400).json({
        error: "É necessário selecionar o gênero e os outros 3 filtros."
      });
    }

    const sql = `
      SELECT i.id_imagem, i.caminho_imagem, i.descricao_imagem
      FROM Imagens i
      INNER JOIN Imagem_Filtros ifilter ON i.id_imagem = ifilter.id_imagem
      WHERE ifilter.id_genero = ? 
        AND ifilter.id_onde_vai = ? 
        AND ifilter.id_periodo = ?
        AND ifilter.id_transmitir = ?
        AND i.status = 'Ativo'
      LIMIT 3;
    `;

    const [rows] = await db.query(sql, [g, f1, f2, f3]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Nenhum look encontrado para esta combinação de filtros."
      });
    }

    return res.json(rows);
  } catch (error) {
    console.error("Erro no motor de busca:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});

// =========================================================================
// 2. ROTA: UPLOAD DE PEÇA PESSOAL (Valida cota do Plano)
// =========================================================================
router.post("/pecas/upload", upload.single("fotoPeca"), async (req, res) => {
  try {
    const { id_usuario } = req.body;

    if (!id_usuario || !req.file) {
      return res.status(400).json({ error: "Usuário não informado ou imagem ausente." });
    }

    // Busca o limite de uploads do plano ativo do usuário
    const [plano] = await db.query(`
      SELECT p.limite_uploads 
      FROM Assinaturas a
      INNER JOIN Planos p ON a.id_plano = p.id_plano
      WHERE a.id_usuario = ? AND a.status IN ('Trial', 'Ativa')
      ORDER BY a.id_assinatura DESC LIMIT 1
    `, [id_usuario]);

    if (plano.length === 0) {
      return res.status(403).json({ error: "O usuário não possui uma assinatura ativa." });
    }

    const limiteUploads = plano[0].limite_uploads;

    // Conta quantas peças ativas o usuário já enviou
    const [pecasEnviadas] = await db.query(
      "SELECT COUNT(*) AS total FROM Pecas_Usuario WHERE id_usuario = ? AND status = 'Ativo'",
      [id_usuario]
    );

    if (pecasEnviadas[0].total >= limiteUploads) {
      return res.status(403).json({
        error: `Atenção: Seu plano permite cadastrar no máximo ${limiteUploads} peças. Faça um upgrade para enviar mais!`
      });
    }

    // Registra a nova peça no banco
    const caminhoImagem = `/uploads/${req.file.filename}`;
    await db.query(
      "INSERT INTO Pecas_Usuario (id_usuario, caminho_imagem, status, data_upload) VALUES (?, ?, 'Ativo', NOW())",
      [id_usuario, caminhoImagem]
    );

    return res.json({ message: "Peça cadastrada com sucesso!", caminho: caminhoImagem });

  } catch (error) {
    console.error("Erro no upload de peça:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});

// =========================================================================
// 3. ROTA: SALVAR LOOKS
// =========================================================================
router.post("/salvar", async (req, res) => {

  try {

    const { id_usuario, imagens } = req.body;

    console.log("ID usuário:", id_usuario);
    console.log("Imagens recebidas:", imagens);

    // =====================================================
    // 1. Verifica usuário
    // =====================================================

    if (!id_usuario) {
      return res.status(400).json({
        error: "Usuário não informado."
      });
    }

    // =====================================================
    // 2. Verifica as imagens
    // =====================================================

    if (!imagens || !Array.isArray(imagens)) {
      return res.status(400).json({
        error: "As imagens não foram informadas."
      });
    }

    // =====================================================
    // 3. Precisa receber exatamente 3 imagens
    // =====================================================

    if (imagens.length !== 3) {
      return res.status(400).json({
        error: "É necessário enviar exatamente 3 imagens."
      });
    }

    // =====================================================
    // 4. Busca o plano ativo do usuário
    // =====================================================

    const [plano] = await db.query(`
      SELECT 
        p.id_plano,
        p.limite_looks_salvos,
        p.dias_armazenamento
      FROM Assinaturas a
      INNER JOIN Planos p
        ON a.id_plano = p.id_plano
      WHERE a.id_usuario = ?
        AND a.status IN ('Trial', 'Ativa')
      ORDER BY a.id_assinatura DESC
      LIMIT 1
    `, [id_usuario]);

    // =====================================================
    // 5. Verifica se encontrou plano
    // =====================================================

    if (plano.length === 0) {

      return res.status(403).json({
        error: "O usuário não possui uma assinatura ativa."
      });

    }

    const id_plano = plano[0].id_plano;
    const limiteLooks = plano[0].limite_looks_salvos;

    console.log("ID do plano:", id_plano);
    console.log("Limite de looks:", limiteLooks);

    // =====================================================
    // 6. Conta quantos looks o usuário já possui
    // =====================================================

    const [looksSalvos] = await db.query(`
      SELECT COUNT(*) AS total
      FROM Looks_Salvos
      WHERE id_usuario = ?
      AND data_expira >= NOW()
    `, [id_usuario]);

    const totalAtual = looksSalvos[0].total;

    console.log("Looks atuais:", totalAtual);

    // =====================================================
    // 7. Verifica limite do plano
    // =====================================================

    if (totalAtual + imagens.length > limiteLooks) {

      return res.status(403).json({

        error:
          `Você já possui ${totalAtual} looks salvos. ` +
          `Seu plano permite no máximo ${limiteLooks} looks.`

      });

    }

    // =====================================================
    // 8. Salva as 3 imagens
    //
    // NÃO precisamos informar data_expira.
    //
    // O TRIGGER do MySQL vai calcular automaticamente.
    // =====================================================

    for (const id_imagem of imagens) {

      await db.query(`
        INSERT INTO Looks_Salvos
        (
          id_usuario,
          id_imagem,
          id_plano
        )
        VALUES (?, ?, ?)
      `, [
        id_usuario,
        id_imagem,
        id_plano
      ]);

    }

    // =====================================================
    // 9. Retorna sucesso
    // =====================================================

    return res.status(201).json({

      message:
        "Os três looks foram salvos no seu guarda-roupa virtual com sucesso!"

    });

  } catch (error) {

    console.error(
      "Erro ao salvar os looks:",
      error
    );

    return res.status(500).json({
      error: "Erro interno no servidor."
    });

  }

});
// =========================================================================
// 4. ROTA: HISTÓRICO DE LOOKS SALVOS (Filtra looks dentro do prazo válido)
// =========================================================================
router.get("/historico/:id_usuario", async (req, res) => {
  try {
    const { id_usuario } = req.params;

    // Retorna apenas os looks onde a data_expira é maior ou igual à data/hora atual
    const sql = `
      SELECT ls.id_look_salvo, ls.data_salvo, ls.data_expira, i.caminho_imagem, i.descricao_imagem
      FROM Looks_Salvos ls
      INNER JOIN Imagens i ON ls.id_imagem = i.id_imagem
      WHERE ls.id_usuario = ? AND ls.data_expira >= NOW()
      ORDER BY ls.data_salvo DESC;
    `;

    const [historico] = await db.query(sql, [id_usuario]);

    return res.json(historico);
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});

// =========================================================================
// 5. ROTA: REMOVER LOOK SALVO
// =========================================================================
router.delete("/salvar/:id_look_salvo", async (req, res) => {
  try {
    const { id_look_salvo } = req.params;
    const { id_usuario } = req.body;

    await db.query(
      "DELETE FROM Looks_Salvos WHERE id_look_salvo = ? AND id_usuario = ?",
      [id_look_salvo, id_usuario]
    );

    return res.json({ message: "Look removido com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar look salvo:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});

export default router;