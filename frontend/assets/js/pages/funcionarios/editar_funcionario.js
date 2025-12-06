document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const cpfInput = document.getElementById('cpf');
    const cpfError = document.getElementById('cpf-error');
    const cpfDuplicateError = document.getElementById('cpf-duplicate-error');

    // Função para verificar se CPF já existe (excluindo o atual)
    async function verificarCPFExistente(cpf, excludeId) {
        try {
            const response = await fetch(`/api/tutores?cpf=${cpf}`);
            if (response.ok) {
                const tutores = await response.json();
                return tutores.some(tutor => tutor.cpf === cpf && tutor.cod !== excludeId);
            }
            return false;
        } catch (error) {
            console.error('Erro ao verificar CPF:', error);
            return false;
        }
    }

    try {
        // Buscar dados do tutor
        const response = await fetch(`/api/tutores/${id}`);
        if (!response.ok) {
            throw new Error('Tutor não encontrado');
        }
        const tutor = await response.json();

        // Preenche os campos
        document.getElementById('name').value = tutor.nome;
        document.getElementById('cpf').value = aplicarMascaraCPF(tutor.cpf);
        document.getElementById('endereco').value = tutor.endereco;
        document.getElementById('email').value = tutor.email;
        document.getElementById('telefone').value = aplicarMascaraTelefone(tutor.telefone);

        const btnStatus = document.getElementById('btn-status');
        if (tutor.status) {
            btnStatus.textContent = 'Desativar';
            btnStatus.style.backgroundColor = '#dc3545';
        } else {
            btnStatus.textContent = 'Ativar';
            btnStatus.style.backgroundColor = '#28a745';
        }

        // Adicionar evento de submit ao formulário
        const form = document.getElementById('tutorEditForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Confirmar antes de gravar
            const confirmacao = confirm('Deseja realmente atualizar este tutor?');
            if (!confirmacao) {
                return;
            }

            const formData = {
                nome: document.getElementById('name').value,
                cpf: document.getElementById('cpf').value.replace(/\D/g, ''), // Remove formatação, mantém apenas números
                endereco: document.getElementById('endereco').value,
                email: document.getElementById('email').value,
                telefone: document.getElementById('telefone').value.replace(/\D/g, ''), // Remove formatação, mantém apenas números
                status: btnStatus.textContent === 'Desativar'
            };

            try {
                const updateResponse = await fetch(`/api/tutores/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (updateResponse.ok) {
                    alert('Tutor atualizado com sucesso!');
                    window.location.href = 'buscar.html';
                } else {
                    const error = await updateResponse.json();
                    throw new Error(error.message || 'Erro ao atualizar tutor');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao atualizar tutor: ' + error.message);
            }
        });

        // Adicionar evento ao botão de status
        btnStatus.addEventListener('click', function () {
            const statusAtual = this.textContent.trim().toLowerCase();
            if (statusAtual === 'desativar') {
                this.textContent = 'Ativar';
                this.style.backgroundColor = '#28a745';
            } else {
                this.textContent = 'Desativar';
                this.style.backgroundColor = '#dc3545';
            }
        });

        const telefoneInput = document.getElementById('telefone');
        const telefoneError = document.getElementById('telefone-error');
        // Verificar CPF duplicado em tempo real
        let timeoutCPF;
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value;
            const cursorPosition = e.target.selectionStart;
            const oldLength = value.length;
            value = aplicarMascaraCPF(value);
            e.target.value = value;
            const newLength = value.length;
            if (newLength > oldLength) {
                e.target.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
            } else {
                e.target.setSelectionRange(cursorPosition, cursorPosition);
            }
            
            // Limpar timeout anterior
            clearTimeout(timeoutCPF);
            
            if (value.length === 14) {
                if (validarCPF(value)) {
                    cpfError.style.display = 'none';
                    cpfInput.style.borderColor = '#28a745';
                    
                    // Verificar se CPF já existe
                    timeoutCPF = setTimeout(async () => {
                        const cpfLimpo = value.replace(/\D/g, '');
                        const existe = await verificarCPFExistente(cpfLimpo, id);
                        if (existe) {
                            cpfDuplicateError.style.display = 'block';
                            cpfInput.style.borderColor = '#dc3545';
                        } else {
                            cpfDuplicateError.style.display = 'none';
                            cpfInput.style.borderColor = '#28a745';
                        }
                    }, 500);
                } else {
                    cpfError.style.display = 'block';
                    cpfDuplicateError.style.display = 'none';
                    cpfInput.style.borderColor = '#dc3545';
                }
            } else {
                cpfError.style.display = 'none';
                cpfDuplicateError.style.display = 'none';
                cpfInput.style.borderColor = '';
            }
        });
        cpfInput.addEventListener('blur', async function(e) {
            const cpf = e.target.value;
            if (cpf && cpf.length === 14) {
                if (!validarCPF(cpf)) {
                    cpfError.style.display = 'block';
                    cpfDuplicateError.style.display = 'none';
                    cpfInput.style.borderColor = '#dc3545';
                } else {
                    cpfError.style.display = 'none';
                    // Verificar se CPF já existe
                    const cpfLimpo = cpf.replace(/\D/g, '');
                    const existe = await verificarCPFExistente(cpfLimpo, id);
                    if (existe) {
                        cpfDuplicateError.style.display = 'block';
                        cpfInput.style.borderColor = '#dc3545';
                    } else {
                        cpfDuplicateError.style.display = 'none';
                        cpfInput.style.borderColor = '#28a745';
                    }
                }
            } else {
                cpfError.style.display = 'none';
                cpfDuplicateError.style.display = 'none';
                cpfInput.style.borderColor = '';
            }
        });
        // Máscara Telefone
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value;
            const cursorPosition = e.target.selectionStart;
            value = aplicarMascaraTelefone(value);
            e.target.value = value;
            let newCursorPosition = cursorPosition;
            const originalValue = value.replace(/\D/g, '');
            const originalPosition = Math.min(cursorPosition, originalValue.length);
            let count = 0;
            let digitCount = 0;
            for (let i = 0; i < value.length && digitCount < originalPosition; i++) {
                if (/\d/.test(value[i])) digitCount++;
                count++;
            }
            newCursorPosition = count;
            e.target.setSelectionRange(newCursorPosition, newCursorPosition);
            if (value.length >= 14) {
                if (validarTelefone(value)) {
                    telefoneError.style.display = 'none';
                    telefoneInput.style.borderColor = '#28a745';
                } else {
                    telefoneError.style.display = 'block';
                    telefoneInput.style.borderColor = '#dc3545';
                }
            } else {
                telefoneError.style.display = 'none';
                telefoneInput.style.borderColor = '';
            }
        });
        telefoneInput.addEventListener('blur', function(e) {
            const telefone = e.target.value;
            if (telefone && telefone.length >= 14) {
                if (!validarTelefone(telefone)) {
                    telefoneError.style.display = 'block';
                    telefoneInput.style.borderColor = '#dc3545';
                } else {
                    telefoneError.style.display = 'none';
                    telefoneInput.style.borderColor = '#28a745';
                }
            } else {
                telefoneError.style.display = 'none';
                telefoneInput.style.borderColor = '';
            }
        });
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar dados do tutor: ' + error.message);
        window.location.href = 'buscar.html';
    }
});

// Funções de máscara e validação (copiadas do cadastrar.js)
function aplicarMascaraCPF(value) {
    let cpfLimpo = value.replace(/\D/g, '');
    cpfLimpo = cpfLimpo.substring(0, 11);
    if (cpfLimpo.length <= 3) {
        return cpfLimpo;
    } else if (cpfLimpo.length <= 6) {
        return cpfLimpo.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    } else if (cpfLimpo.length <= 9) {
        return cpfLimpo.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    } else {
        return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    }
}
function validarCPF(cpf) {
    cpf = (cpf || '').replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    return true;
}
function aplicarMascaraTelefone(value) {
    let telefoneLimpo = value.replace(/\D/g, '');
    telefoneLimpo = telefoneLimpo.substring(0, 11);
    if (telefoneLimpo.length <= 2) {
        return telefoneLimpo;
    } else if (telefoneLimpo.length <= 6) {
        return telefoneLimpo.replace(/(\d{2})(\d{0,4})/, '($1) $2');
    } else if (telefoneLimpo.length <= 10) {
        return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
        return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
}
function validarTelefone(telefone) {
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length < 10) return false;
    if (/^(\d)\1{9,}$/.test(telefoneLimpo)) return false;
    const ddd = parseInt(telefoneLimpo.substring(0, 2));
    if (ddd < 11 || ddd > 99) return false;
    return true;
}