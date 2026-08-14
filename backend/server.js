// import express from "express";
// import cors from "cors";
// import dotenv  from "dotenv";
// import cookieParser from "cookie-parser";
// import routeCompras from "./src/routes/comprasRoutes.js";
// import routeCategoria from "./src/routes/categoriaRoutes.js";
// import routeClientes from "./src/routes/clienteRoutes.js";
// import routeEditoras from "./src/routes/editoraRoutes.js";
// import routeLivro from "./src/routes/livroRoutes.js";
// import userRouter from "./src/routes/userRoute.js";
// import loginRoute from "./src/routes/loginRoute.js";
// import enderecoRouter from "./src/routes/enderecoRoute.js";
// import uploadRoute from "./src/routes/uploadRoute.js";




// dotenv.config();

// const app = express();

// app.use(express.json());

// app.use(cors({
//   origin: "http://localhost:3001",
//   credentials: true,
// }));

// app.use(cookieParser());

// const PORT = process.env.PORT_SERVER || 3001;

// app.use("/clientes", routeClientes);
// app.use("/compras", routeCompras);
// app.use("/categorias", routeCategoria);
// app.use("/livros", routeLivro);
// app.use("/editoras", routeEditoras);
// app.use("/users", userRouter);
// app.use("/auth", loginRoute);
// app.use("/endereco", enderecoRouter);
// app.use("/upload", uploadRoute);

// app.listen(PORT, () => {
//   return console.log(`Servidor rodando http://localhost:${PORT}`);
// });


// //segundo codigo---------------------------------------------------
 
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";
 
// // Importação das rotas
// // import routeCompras from "./src/routes/comprasRoutes.js";
// // import routeCategoria from "./src/routes/categoriaRoutes.js";
// // import routeClientes from "./src/routes/clienteRoutes.js";
// // import routeEditoras from "./src/routes/editoraRoutes.js";
// // import routeLivro from "./src/routes/livroRoutes.js";
// import routeLooks from "./src/routes/routeLooks.js"; // Nova rota do Montalook
// import rotaCliente from "./src/routes/clienteRoute.js";
// import loginRoute from "./src/routes/loginRoute.js";


// dotenv.config();
 
// const app = express();
// app.use(express.json());
// app.use(cors());
// app.use('/frontend', express.static('../frontend'));
// app.use("/login", loginRoute)
 
// const PORT = process.env.PORT_SERVER || 3001;
 
// // Ativação dos endpoints
// // app.use("/clientes", routeClientes);
// // app.use("/compras", routeCompras);
// // app.use("/categorias", routeCategoria);
// // app.use("/livros", routeLivro);
// // app.use("/editoras", routeEditoras);
// app.use("/looks", routeLooks); // Endpoint para o formulário inteligente
// app.use("/clientes", rotaCliente);
// // Configuração do __dirname para ES Modules (ESM)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
 
// // Servir a pasta de uploads localmente de forma correta
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
 
// app.listen(PORT, () => {
//   console.log(`Servidor rodando em http://localhost:${PORT}`);
// });











// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";

// dotenv.config();

// // Importação das rotas ativas do MontaLook
// import routeLooks from "./src/routes/routeLooks.js";
// import rotaCliente from "./src/routes/clienteRoute.js";
// import loginRoute from "./src/routes/loginRoute.js";



// const app = express();

// // --- 1. MIDDLEWARES GLOBAIS ---
// app.use(express.json());
// app.use(cors());

// app.use((req, res, next) => {
//   res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
//   res.set('Pragma', 'no-cache');
//   res.set('Expires', '0');
//   next();
// });

// // --- 2. CONFIGURAÇÃO DE DIRETÓRIOS E ESTÁTICOS (ESM) ---
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.use('/frontend', express.static(path.join(__dirname, '../frontend')));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // --- 3. ATIVAÇÃO DOS ENDPOINTS / ROTAS ---
// // Concentra Login e Cadastro sob o prefixo /auth
// // app.use("/auth", loginRoute); 
// app.use("/looks", routeLooks);
// app.use("/clientes", rotaCliente);
// app.use("/", loginRoute);


// // --- 4. INICIALIZAÇÃO DO SERVIDOR ---
// const PORT = process.env.PORT_SERVER || 3001;

// app.listen(PORT, () => {
//   console.log(`🚀 Servidor MontaLook rodando em http://localhost:${PORT}`);
// });








import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import loginController from "../backend/src/controllers/loginController.js";
import pool from "../backend/src/database/database.js";

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

    const [usuarioExistente] = await pool.query(
      "SELECT id_usuario FROM Usuarios WHERE email = ? OR cpf = ? LIMIT 1",
      [email, cpf]
    );

    if (usuarioExistente.length > 0) {
      return res.status(400).json({ error: "E-mail ou CPF já cadastrados no sistema." });
    }

    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    const [resultado] = await pool.query(
      `INSERT INTO Usuarios (nome, email, cpf, telefone, senha, status, data_criacao) 
       VALUES (?, ?, ?, ?, ?, 'ativo', NOW())`,
      [nome, email, cpf, telefone || null, senhaHash]
    );

    const novoIdUsuario = resultado.insertId;

    const [planoGratuito] = await pool.query(
      "SELECT id_plano FROM Planos WHERE nome_plano LIKE '%Degustação%' LIMIT 1"
    );

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

// ROTA GET /perfil (VALIDAÇÃO DIRETA DO TOKEN)
router.get("/perfil", async (req, res) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Acesso negado. Token não fornecido." });
        }

        const SECRET_KEY = process.env.JWT_SECRET || "sua_chave_secreta_aqui";
        
        let usuarioDecodificado;
        try {
            usuarioDecodificado = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            return res.status(403).json({ error: "Token inválido ou expirado." });
        }

        const idUsuario = usuarioDecodificado.id || usuarioDecodificado.id_usuario;

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

// ROTA PUT /perfil (VALIDAÇÃO DIRETA DO TOKEN)
router.put("/perfil", async (req, res) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Acesso negado. Token não fornecido." });
        }

        const SECRET_KEY = process.env.JWT_SECRET || "sua_chave_secreta_aqui";
        
        let usuarioDecodificado;
        try {
            usuarioDecodificado = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            return res.status(403).json({ error: "Token inválido ou expirado." });
        }

        const idUsuario = usuarioDecodificado.id || usuarioDecodificado.id_usuario;
        const { nome, username, email, foto, bio, novaSenha } = req.body;

        let query = `UPDATE Usuarios SET nome = ?, username = ?, email = ?, foto = ?, bio = ?`;
        let params = [nome, username, email, foto, bio];

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