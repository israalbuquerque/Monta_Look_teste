// import express from "express";
// import bcrypt from "bcrypt";
// import loginController from "../controllers/loginController.js";
// import pool from "../database/database.js";

// const router = express.Router();

// router.post("/login", loginController.login);

// router.post("/cadastro", async (req, res) => {
//   try {
//     const { nome, email, cpf, telefone, senha } = req.body;

//     if (!nome || !email || !cpf || !senha) {
//       return res.status(400).json({ error: "É necessário informar nome, e-mail, CPF e senha." });
//     }

//     // 1. Checa se e-mail ou CPF já existem
//     const [usuarioExistente] = await pool.query(
//       "SELECT id_usuario FROM Usuarios WHERE email = ? OR cpf = ? LIMIT 1",
//       [email, cpf]
//     );

//     if (usuarioExistente.length > 0) {
//       return res.status(400).json({ error: "E-mail ou CPF já cadastrados no sistema." });
//     }

//     // 2. Hash da senha
//     const saltRounds = 10;
//     const senhaHash = await bcrypt.hash(senha, saltRounds);

//     // 3. Cadastra o Usuário
//     const [resultado] = await pool.query(
//       `INSERT INTO Usuarios (nome, email, cpf, telefone, senha, status, data_criacao) 
//        VALUES (?, ?, ?, ?, ?, 'ativo', NOW())`,
//       [nome, email, cpf, telefone || null, senhaHash]
//     );

//     const novoIdUsuario = resultado.insertId;

//     // 4. Busca o plano gratuito "Degustação (Gratuito)" usando a coluna 'nome_plano'
//     const [planoGratuito] = await pool.query(
//       "SELECT id_plano FROM Planos WHERE nome_plano LIKE '%Degustação%' LIMIT 1"
//     );

//     // Se encontrar o plano (id_plano = 1), insere a assinatura
//     if (planoGratuito.length > 0) {
//       await pool.query(
//         `INSERT INTO Assinaturas (id_usuario, id_plano, status, data_inicio) 
//          VALUES (?, ?, 'Trial', NOW())`,
//         [novoIdUsuario, planoGratuito[0].id_plano]
//       );
//     }

//     return res.status(201).json({
//       message: "Usuário cadastrado com sucesso!",
//       id_usuario: novoIdUsuario
//     });

//   } catch (error) {
//     console.error("Erro no cadastro de usuário:", error);
//     return res.status(500).json({ error: "Erro interno no servidor ao realizar cadastro." });
//   }
// });

// app.get('/perfil', autenticarToken, async (req, res) => {
//     try {
//         // Exemplo recuperando o usuário do banco (ajuste conforme seu BD/Query)
//         const usuario = await buscarUsuarioPorId(req.usuario.id);

//         if (!usuario) {
//             return res.status(404).json({ error: "Usuário não encontrado." });
//         }

//         // RETORNA UM JSON VÁLIDO
//         return res.status(200).json({
//             usuario: {
//                 nome: usuario.nome,
//                 username: usuario.username,
//                 email: usuario.email,
//                 foto: usuario.foto,
//                 bio: usuario.bio,
//                 plano: usuario.plano
//             }
//         });
//     } catch (error) {
//         return res.status(500).json({ error: "Erro interno no servidor." });
//     }
// });

// export default router;



import express from "express";
import bcrypt from "bcrypt";
import loginController from "../controllers/loginController.js";
import pool from "../database/database.js";
// Certifique-se de ajustar o caminho do seu middleware de autenticação JWT se ele estiver em outro arquivo
import autenticarToken from "../middlewares/autenticarToken.js"; 

const router = express.Router();

// ROTA DE LOGIN
router.post("/login", loginController.login);

// ROTA DE CADASTRO
router.post("/cadastro", async (req, res) => {
  try {
    const { nome, email, cpf, telefone, senha } = req.body;

    if (!nome || !email || !cpf || !senha) {
      return res.status(400).json({ error: "É necessário informar nome, e-mail, CPF e senha." });
    }

    // 1. Checa se e-mail ou CPF já existem
    const [usuarioExistente] = await pool.query(
      "SELECT id_usuario FROM Usuarios WHERE email = ? OR cpf = ? LIMIT 1",
      [email, cpf]
    );

    if (usuarioExistente.length > 0) {
      return res.status(400).json({ error: "E-mail ou CPF já cadastrados no sistema." });
    }

    // 2. Hash da senha
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // 3. Cadastra o Usuário
    const [resultado] = await pool.query(
      `INSERT INTO Usuarios (nome, email, cpf, telefone, senha, status, data_criacao) 
       VALUES (?, ?, ?, ?, ?, 'ativo', NOW())`,
      [nome, email, cpf, telefone || null, senhaHash]
    );

    const novoIdUsuario = resultado.insertId;

    // 4. Busca o plano gratuito "Degustação (Gratuito)" usando a coluna 'nome_plano'
    const [planoGratuito] = await pool.query(
      "SELECT id_plano FROM Planos WHERE nome_plano LIKE '%Degustação%' LIMIT 1"
    );

    // Se encontrar o plano, insere a assinatura
    if (planoGratuito.length > 0) {
      await pool.query(
        `INSERT INTO Assinaturas (id_usuario, id_plano, status, data_inicio) 
         VALUES (?, ?, 'Trial', NOW())`,
        [novoIdUsuario, planoGratuito[0].id_plano]
      );
    }

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      id_usuario: novoIdUsuario
    });

  } catch (error) {
    console.error("Erro no cadastro de usuário:", error);
    return res.status(500).json({ error: "Erro interno no servidor ao realizar cadastro." });
  }
});

// ROTA DE CONSULTA DO PERFIL (Alterado de app.get para router.get)
router.get("/perfil", autenticarToken, async (req, res) => {
    try {
        // req.usuario.id vem do payload decodificado pelo middleware JWT (autenticarToken)
        const idUsuario = req.usuario.id || req.usuario.id_usuario;

        // Query no MySQL buscando os dados do usuário + nome do plano atual
        const [rows] = await pool.query(
            `SELECT u.nome, u.email, u.username, u.foto, u.bio, p.nome_plano AS plano
             FROM Usuarios u
             LEFT JOIN Assinaturas a ON u.id_usuario = a.id_usuario
             LEFT JOIN Planos p ON a.id_plano = p.id_plano
             WHERE u.id_usuario = ? 
             LIMIT 1`,
            [idUsuario]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        const usuario = rows[0];

        return res.status(200).json({
            usuario: {
                nome: usuario.nome,
                username: usuario.username || "",
                email: usuario.email,
                foto: usuario.foto || null,
                bio: usuario.bio || "",
                plano: usuario.plano || "Essencial"
            }
        });
    } catch (error) {
        console.error("Erro na rota GET /perfil:", error);
        return res.status(500).json({ error: "Erro interno no servidor ao buscar perfil." });
    }
});

// ROTA DE ATUALIZAÇÃO DO PERFIL (PUT)
router.put("/perfil", autenticarToken, async (req, res) => {
    try {
        const idUsuario = req.usuario.id || req.usuario.id_usuario;
        const { nome, username, email, foto, bio, novaSenha } = req.body;

        // 1. Atualiza dados básicos
        let query = `UPDATE Usuarios SET nome = ?, username = ?, email = ?, foto = ?, bio = ?`;
        let params = [nome, username, email, foto, bio];

        // 2. Se enviou nova senha, adiciona no update
        if (novaSenha && novaSenha.trim() !== "") {
            const senhaHash = await bcrypt.hash(novaSenha, 10);
            query += `, senha = ?`;
            params.push(senhaHash);
        }

        query += ` WHERE id_usuario = ?`;
        params.push(idUsuario);

        await pool.query(query, params);

        return res.status(200).json({ message: "Perfil atualizado com sucesso!" });
    } catch (error) {
        console.error("Erro na rota PUT /perfil:", error);
        return res.status(500).json({ error: "Erro ao atualizar dados do perfil." });
    }
});

export default router;