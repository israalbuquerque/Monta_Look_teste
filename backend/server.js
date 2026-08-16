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
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Importação das rotas ativas do MontaLook
import routeLooks from "./src/routes/routeLooks.js";
import rotaCliente from "./src/routes/clienteRoute.js";
import loginRoute from "./src/routes/loginRoute.js";

const app = express();

// --- 1. MIDDLEWARES GLOBAIS ---
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// --- 2. CONFIGURAÇÃO DE DIRETÓRIOS E ESTÁTICOS (ESM) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/frontend', express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 3. ATIVAÇÃO DOS ENDPOINTS / ROTAS ---
// Mapeia as rotas de auth/login/perfil tanto sob /auth quanto na raiz para evitar divergência com o frontend
app.use("/auth", loginRoute);
app.use("/", loginRoute);

app.use("/looks", routeLooks);
app.use("/clientes", rotaCliente);


// --- 4. TRATAMENTO DE ERROS E ROTAS NÃO ENCONTRADAS ---
// Captura requisições para rotas inexistentes
app.use((req, res) => {
  console.warn(`⚠️ Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Rota ${req.originalUrl} não encontrada no servidor.` });
});

// Middleware global de tratamento de exceções
app.use((err, req, res, next) => {
  console.error("🔥 Erro não tratado no servidor:", err);
  res.status(500).json({ error: "Erro interno no servidor." });
});

// --- 5. INICIALIZAÇÃO DO SERVIDOR ---
const PORT = process.env.PORT_SERVER || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor MontaLook rodando na porta ${PORT}`);
});







