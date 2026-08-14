import pool from "../database/database.js";

class ClienteModel{
    async mostrarClientes(){
        const [resultado] = await pool.execute("select * from usuarios;");
        return resultado
    }
}

export default new ClienteModel();