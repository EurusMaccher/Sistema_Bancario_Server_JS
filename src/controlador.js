const express = require('express')
const controlador = express()
let { banco, contas, saques, depositos, transferencias } = require('./bancodedados')
const password = "Cubos123Bank"


function verificar(numero_conta) {
    return contas.find((conta) => {
        return conta.numero === Number(numero_conta)
    })
}

controlador.use(express.json())

// inicio da funcionalidade para ver contas em geral

const verContas = (req, res) => {
    const { senha_banco } = req.query

    if (!senha_banco) {
        return res.status(400).json({ mensagem: "Senha bancaria não informado" })
    }

    if (senha_banco !== password) {
        return res.status(401).json({ mensagem: "A senha do banco informada é inválida!" })
    }

    if (senha_banco) {
        res.json(contas)
    }


}

// inicio da funcionalidade para criar contas

const criarContas = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

    const contaExistente = contas.find((conta) => conta.usuario.cpf === cpf || conta.usuario.email === email)



    if (contaExistente) {
        return res.status(400).json({ mensagem: "Já existe uma conta com o CPF ou e-mail informado!" })
    }


    if (!nome || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ mensagem: "Algum dado obrigatorio está faltando. Verifique" })
    }

    const novaConta = {
        numero: (contas.length + 1),
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha,
        }

    }
    contas.push(novaConta)
    return res.status(201).json()


}

// inicio da funcionalidade para atualizar conta

const atualizarContas = (req, res) => {
    const numeroConta = req.params.numeroConta

    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ mensagem: "Todos os campos devem ser fornecidos no corpo da requisição." })
    }


    const conta = verificar(numeroConta)

    if (!conta) {
        return res.status(404).json({ mensagem: "Conta não encontrada." })
    }

    const cpfExistente = contas.some((contaExistente) => contaExistente.numero !== numeroConta && contaExistente.usuario.cpf === cpf)
    const emailExistente = contas.some((contaExistente) => contaExistente.numero !== numeroConta && contaExistente.usuario.email === email)

    if (cpfExistente) {
        return res.status(400).json({ mensagem: "O CPF informado já existe cadastrado!" })
    }

    if (emailExistente) {
        return res.status(400).json({ mensagem: "O e-mail informado já existe cadastrado!" })
    }

    conta.usuario = {
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha,
    };

    return res.status(204).send();


}

// inicio da funcionalidade para deletar conta

const deletarConta = (req, res) => {

    const { numeroConta } = req.params

    const contaIndex = contas.find((conta) => {
        return conta.numero === Number(numeroConta)
    })


    if (!contaIndex) {
        return res.status(404).json({ mensagem: "Conta não encontrada." })

    }

    if (contaIndex.saldo !== 0) {
        return res.status(400).json({ mensagem: 'A conta só pode ser removida se o saldo for zero!' })
    }

    contas = contas.filter((conta) => {
        return conta.numero !== Number(numeroConta)
    })

    return res.status(204).send()

}

// inicio da funcionalidade para fazer deposito

const movimentacaoDeposito = (req, res) => {
    const { numero_conta, valor } = req.body

    if (!numero_conta || !valor) {
        return res.status(400).json({ "mensagem": "O número da conta e o valor são obrigatórios!" })
    }

    const contaIndex = verificar(Number(numero_conta))

    if (!contaIndex) {
        return res.status(400).json({ "mensagem": "O número da conta é invalido" })
    }

    if (valor <= 0) {
        return res.status(400).json({ "mensagem": "O valor a ser depositado é invalido" })
    }

    contaIndex.saldo += Number(valor)




    depositos.push({
        data: new Date().toLocaleString(),
        numero_conta,
        valor

    })

    return res.status(201).send()


}

// inicio da funcionalidade para fazer saque

const movimentacaoSaque = (req, res) => {
    const { numero_conta, valor, senha } = req.body

    if (!numero_conta || !valor || !senha) {
        return res.status(400).json({ "mensagem": "O número da conta, valor ou senha são obrigatórios!" })

    }

    const conta = verificar(numero_conta)

    if (!conta) {
        return res.status(400).json({ "mensagem": "O número da conta é invalido" })
    }

    if (valor <= 0) {
        return res.status(400).json({ "mensagem": "O valor a ser depositado é invalido" })
    }

    const VerificarSenha = senha === conta.usuario.senha

    if (!VerificarSenha) {
        return res.status(400).json({ "mensagem": "A senha é invalida" })
    }


    if (conta.saldo < valor) {
        return res.status(400).json({ "mensagem": "O valor não pode ser sacado por falta de saldo" })
    }

    conta.saldo -= Number(valor)


    saques.push({
        data: new Date().toLocaleString(),
        numero_conta,
        valor

    })

    return res.status(201).send()


}

// inicio da funcionalidade para fazer transferencia de saldo para outra conta

const movimentacaoTransf = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body

    if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
        return res.status(400).json({ "mensagem": "ausencia de dados obrigatorios" })

    }

    if (numero_conta_destino === numero_conta_origem) {
        return res.status(400).json({ "mensagem": "Conta de origem não pode ser a mesma da conta de destino" })
    }

    const contaOrigem = verificar(numero_conta_origem)
    const contaDestino = verificar(numero_conta_destino)

    if (!contaOrigem) {
        return res.status(400).json({ "mensagem": "O número da conta de Origem é invalido" })
    }

    if (!contaDestino) {
        return res.status(400).json({ "mensagem": "O número da conta de Origem é invalido" })
    }

    if (valor <= 0) {
        return res.status(400).json({ "mensagem": "O valor a ser depositado é invalido" })
    }

    const VerificarSenha = senha === contaOrigem.usuario.senha

    if (!VerificarSenha) {
        return res.status(400).json({ "mensagem": "A senha é invalida" })
    }


    if (contaOrigem.saldo < valor) {
        return res.status(400).json({ "mensagem": "O valor não pode ser sacado por falta de saldo" })
    }

    contaOrigem.saldo -= Number(valor)
    contaDestino.saldo += Number(valor)

    transferencias.push({
        data: new Date().toLocaleString(),
        numero_conta_origem,
        numero_conta_destino,
        valor

    })


    return res.status(201).send()

}

// inicio da funcionalidade para consultar saldo

const movimentacaoSaldo = (req, res) => {
    const { numero_conta, senha } = req.query

    const conta = verificar(numero_conta)

    if (!conta) {
        return res.status(400).json({ "mensagem": "Conta bancária não encontada!" })
    }

    const VerificarSenha = senha === conta.usuario.senha

    if (!VerificarSenha) {
        return res.status(400).json({ "mensagem": "Senha invalida" })
    }


    return res.status(200).json({ saldo: conta.saldo })

}

// inicio da funcionalidade para consultar extrato

const movimentacaoExtrato = (req, res) => {
    const { numero_conta, senha } = req.query

    const conta = verificar(numero_conta)

    if (!conta) {
        return res.status(400).json({ "mensagem": "Conta bancária não encontrada!" })
    }

    const VerificarSenha = senha === conta.usuario.senha

    if (!VerificarSenha) {
        return res.status(400).json({ "mensagem": "Senha inválida" })
    }

    const consuldeposit = depositos.filter(item => item.numero_conta == numero_conta)
    const consulsaques = saques.filter(item => item.numero_conta == numero_conta)
    const transfRealizada = transferencias.filter(item => item.numero_conta_origem == numero_conta)
    const transfRecebidas = transferencias.filter(item => item.numero_conta_destino == numero_conta)


    const extrato = {
        depositos: consuldeposit,
        saques: consulsaques,
        transferenciasEnviadas: transfRealizada,
        transferenciasRecebidas: transfRecebidas,
    }

    return res.status(200).json(extrato)
}




module.exports = {
    verContas,
    criarContas,
    atualizarContas,
    deletarConta,
    movimentacaoDeposito,
    movimentacaoSaque,
    movimentacaoTransf,
    movimentacaoSaldo,
    movimentacaoExtrato
}
