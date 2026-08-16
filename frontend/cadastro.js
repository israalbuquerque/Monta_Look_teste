document.addEventListener("DOMContentLoaded", function () {

    console.log("cadastro.js foi carregado!");

    // =====================================================
    // ELEMENTOS
    // =====================================================
    const formulario = document.getElementById("cadastroCliente");
    const pagamentos = document.getElementById("pagamentos");

    const modalPixElemento = document.getElementById("modalPix");
    const modalCartaoElemento = document.getElementById("modalCartao");

    const btnCopiarPix = document.getElementById("btnCopiarPix");
    const btnFinalizarCartao = document.getElementById("btnFinalizarCartao");

    // Objeto temporário para guardar os dados do cartão se a forma de pagamento for cartão
    let dadosCartaoTemporarios = null;

    // Instâncias do Bootstrap Modal (reaproveitáveis)
    let modalPixInstance = modalPixElemento ? new bootstrap.Modal(modalPixElemento) : null;
    let modalCartaoInstance = modalCartaoElemento ? new bootstrap.Modal(modalCartaoElemento) : null;

    // =====================================================
    // ESCOLHA DA FORMA DE PAGAMENTO
    // =====================================================
    if (pagamentos) {
        pagamentos.addEventListener("change", function () {
            console.log("Pagamento escolhido:", pagamentos.value);

            // Reseta os dados do cartão ao trocar a opção
            dadosCartaoTemporarios = null;

            if (pagamentos.value === "Pix" && modalPixInstance) {
                modalPixInstance.show();
            }

            if ((pagamentos.value === "Cartão Crédito" || pagamentos.value === "Cartão Débito") && modalCartaoInstance) {
                modalCartaoInstance.show();
            }
        });
    }

    // =====================================================
    // COPIAR CHAVE PIX
    // =====================================================
    if (btnCopiarPix) {
        btnCopiarPix.addEventListener("click", async function () {
            const chavePix = document.getElementById("chavePix");
            const mensagemPix = document.getElementById("mensagemPix");

            try {
                await navigator.clipboard.writeText(chavePix.value);
                mensagemPix.className = "text-success text-center";
                mensagemPix.textContent = "Chave PIX copiada com sucesso!";
            } catch (erro) {
                console.error(erro);
                mensagemPix.className = "text-danger text-center";
                mensagemPix.textContent = "Não foi possível copiar a chave PIX.";
            }
        });
    }

    // =====================================================
    // FINALIZAR DADOS DO CARTÃO
    // =====================================================
    if (btnFinalizarCartao) {
        btnFinalizarCartao.addEventListener("click", function () {
            const tipoCartao = document.getElementById("tipoCartao")?.value;
            const nomeCartao = document.getElementById("nomeCartao")?.value.trim();
            const numeroCartao = document.getElementById("numeroCartao")?.value.trim();
            const validadeCartao = document.getElementById("validadeCartao")?.value.trim();
            const cvvCartao = document.getElementById("cvvCartao")?.value.trim();
            const mensagemCartao = document.getElementById("mensagemCartao");

            if (!tipoCartao || !nomeCartao || !numeroCartao || !validadeCartao || !cvvCartao) {
                if (mensagemCartao) {
                    mensagemCartao.className = "text-danger text-center";
                    mensagemCartao.textContent = "Preencha todos os dados do cartão.";
                }
                return;
            }

            // Armazena os dados validados
            dadosCartaoTemporarios = {
                tipoCartao,
                nomeCartao,
                numeroCartao,
                validadeCartao,
                cvvCartao
            };

            if (mensagemCartao) {
                mensagemCartao.className = "text-success text-center";
                mensagemCartao.textContent = "Dados do cartão preenchidos com sucesso!";
            }

            setTimeout(function () {
                if (modalCartaoInstance) {
                    modalCartaoInstance.hide();
                }
            }, 1000);
        });
    }

    // =====================================================
    // ENVIO DO CADASTRO (backend fetch)
    // =====================================================
    if (formulario) {
        formulario.addEventListener("submit", async function (event) {
            event.preventDefault();

            const nome = document.getElementById("nome").value.trim();
            const cpf = document.getElementById("cpf").value.trim();
            const email = document.getElementById("email").value.trim();
            const senha = document.getElementById("senha").value;
            const confirmarSenha = document.getElementById("confirmarSenha").value;
            const plano = document.getElementById("planos").value;
            const pagamento = document.getElementById("pagamentos").value;

            if (senha !== confirmarSenha) {
                alert("As senhas não são iguais.");
                return;
            }

            if (!pagamento) {
                alert("Escolha uma forma de pagamento.");
                return;
            }

            // Garante que o cartão foi preenchido se a opção for Cartão
            if ((pagamento === "Cartão Crédito" || pagamento === "Cartão Débito") && !dadosCartaoTemporarios) {
                alert("Preencha e confirme os dados do cartão no modal antes de prosseguir.");
                return;
            }

            const dadosCadastro = {
                nome,
                cpf,
                email,
                senha,
                plano,
                pagamento,
                ...(dadosCartaoTemporarios && { cartao: dadosCartaoTemporarios })
            };

            try {
             const resposta = await fetch('http://localhost:3001/cadastro', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(dadosCadastro)
});

                const resultado = await resposta.json();

                if (resposta.ok) {
                    alert("Cadastro realizado com sucesso!");
                    window.location.href = "/login";
                } else {
                    alert(resultado.mensagem || "Erro ao realizar cadastro.");
                }
            } catch (erro) {
                console.error("Erro na requisição:", erro);
                alert("Falha na comunicação com o servidor.");
            }
        });
    }
});