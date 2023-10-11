const express = require('express')
const rota = express()
const { verContas, criarContas,
    atualizarContas, deletarConta,
    movimentacaoDeposito, movimentacaoSaque,
    movimentacaoTransf, movimentacaoSaldo, movimentacaoExtrato } = require('./controlador')


rota.get('/contas', verContas)
rota.post('/contas', criarContas)
rota.put('/contas/:numeroConta/usuario', atualizarContas)
rota.delete('/contas/:numeroConta', deletarConta)
rota.post('/transacoes/depositar', movimentacaoDeposito)
rota.post('/transacoes/sacar', movimentacaoSaque)
rota.post('/transacoes/transferir', movimentacaoTransf)
rota.get('/contas/saldo', movimentacaoSaldo)
rota.get('/contas/extrato', movimentacaoExtrato)



module.exports = rota