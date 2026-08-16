import jwt from "jsonwebtoken";

/**
 * Middleware para autenticação e verificação do Token JWT
 */
export default function autenticarToken(req, res, next) {
    // 1. Obtém o cabeçalho 'Authorization' da requisição
    const authHeader = req.headers["authorization"];
    
    // O token geralmente vem no formato "Bearer <TOKEN>".
    // O split(" ")[1] pega apenas o hash do token após o espaço.
    const token = authHeader && authHeader.split(" ")[1];

    // 2. Se o token não for enviado, bloqueia o acesso imediatamente (401 Unauthorized)
    if (!token) {
        return res.status(401).json({ error: "Acesso negado. Token não fornecido." });
    }

    // 3. Define a chave secreta usada para assinar o JWT
    const SECRET_KEY = process.env.JWT_SECRET || "sua_chave_secreta_aqui";

    // 4. Valida se o token é autêntico e não expirou
    jwt.verify(token, SECRET_KEY, (err, usuarioDecodificado) => {
        if (err) {
            return res.status(403).json({ error: "Token inválido ou expirado." });
        }

        // 5. Injeta os dados do usuário verificado dentro do objeto 'req'
        // Isso permite que as rotas subsequentes saibam quem está fazendo a requisição
        req.usuario = usuarioDecodificado;

        // 6. Autoriza a requisição a continuar para a rota final
        next();
    });
}