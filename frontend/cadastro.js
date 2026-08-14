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


// =====================================================
// VERIFICA SE OS ELEMENTOS EXISTEM
// =====================================================

console.log("Formulário:", formulario);
console.log("Pagamento:", pagamentos);
console.log("Modal PIX:", modalPixElemento);
console.log("Modal Cartão:", modalCartaoElemento);


// =====================================================
// ESCOLHA DA FORMA DE PAGAMENTO
// =====================================================

pagamentos.addEventListener("change", function () {

    console.log("Pagamento escolhido:", pagamentos.value);


    // =================================================
    // PIX
    // =================================================

    if (pagamentos.value === "Pix") {

        console.log("Abrindo modal PIX");

        const modalPix = new bootstrap.Modal(
            modalPixElemento
        );

        modalPix.show();
    }


    // =================================================
    // CARTÃO
    // =================================================

    if (
        pagamentos.value === "Cartão Crédito" ||
        pagamentos.value === "Cartão Débito"
    ) {

        console.log("Abrindo modal cartão");

        const modalCartao = new bootstrap.Modal(
            modalCartaoElemento
        );

        modalCartao.show();
    }

});


// =====================================================
// COPIAR CHAVE PIX
// =====================================================

if (btnCopiarPix) {

    btnCopiarPix.addEventListener("click", async function () {

        const chavePix =
            document.getElementById("chavePix");

        const mensagemPix =
            document.getElementById("mensagemPix");


        try {

            await navigator.clipboard.writeText(
                chavePix.value
            );

            mensagemPix.className =
                "text-success text-center";

            mensagemPix.textContent =
                "Chave PIX copiada com sucesso!";

        } catch (erro) {

            console.error(erro);

            mensagemPix.className =
                "text-danger text-center";

            mensagemPix.textContent =
                "Não foi possível copiar a chave PIX.";

        }

    });

}


// =====================================================
// FINALIZAR DADOS DO CARTÃO
// =====================================================

if (btnFinalizarCartao) {

    btnFinalizarCartao.addEventListener(
        "click",
        function () {

            const tipoCartao =
                document.getElementById("tipoCartao").value;

            const nomeCartao =
                document.getElementById("nomeCartao").value.trim();

            const numeroCartao =
                document.getElementById("numeroCartao").value.trim();

            const validadeCartao =
                document.getElementById("validadeCartao").value.trim();

            const cvvCartao =
                document.getElementById("cvvCartao").value.trim();

            const mensagemCartao =
                document.getElementById("mensagemCartao");


            // Verifica preenchimento

            if (
                !tipoCartao ||
                !nomeCartao ||
                !numeroCartao ||
                !validadeCartao ||
                !cvvCartao
            ) {

                mensagemCartao.className =
                    "text-danger text-center";

                mensagemCartao.textContent =
                    "Preencha todos os dados do cartão.";

                return;
            }


            // Tudo preenchido

            mensagemCartao.className =
                "text-success text-center";

            mensagemCartao.textContent =
                "Dados do cartão preenchidos com sucesso!";


            console.log("Cartão preenchido:", {
                tipoCartao,
                nomeCartao,
                numeroCartao,
                validadeCartao,
                cvvCartao
            });


            // Fecha o modal depois de 1 segundo

            setTimeout(function () {

                const modalCartao =
                    bootstrap.Modal.getInstance(
                        modalCartaoElemento
                    );

                if (modalCartao) {
                    modalCartao.hide();
                }

            }, 1000);

        }
    );

}


// =====================================================
// ENVIO DO CADASTRO
// =====================================================

if (formulario) {

    formulario.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const nome =
                document.getElementById("nome").value.trim();

            const cpf =
                document.getElementById("cpf").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const senha =
                document.getElementById("senha").value;

            const confirmarSenha =
                document.getElementById("confirmarSenha").value;

            const plano =
                document.getElementById("planos").value;

            const pagamento =
                document.getElementById("pagamentos").value;


            // =================================================
            // VALIDA SENHAS
            // =================================================

            if (senha !== confirmarSenha) {

                alert(
                    "As senhas não são iguais."
                );

                return;
            }


            // =================================================
            // VERIFICA FORMA DE PAGAMENTO
            // =================================================

            if (!pagamento) {

                alert(
                    "Escolha uma forma de pagamento."
                );

                return;
            }


            // =================================================
            // DADOS DO CADASTRO
            // =================================================

            console.log("Dados do cadastro:", {

                nome,
                cpf,
                email,
                senha,
                plano,
                pagamento

            });


            alert(
                "Cadastro preenchido corretamente!"
            );

        }
    );

}


});
