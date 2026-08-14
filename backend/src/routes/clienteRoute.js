import express from "express";
import clienteController from "../controllers/clienteController.js";

const rotaCliente = express.Router();

rotaCliente.get("/", clienteController.pegarTodosClientes)

export default rotaCliente;