import clienteModels from "../models/clienteModels.js";

class ClienteContoller{
    async pegarTodosClientes(req, res){
        const todosClientes = await clienteModels.mostrarClientes();
        return res.json(todosClientes);
    }
}

export default new ClienteContoller();