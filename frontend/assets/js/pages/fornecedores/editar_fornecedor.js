document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const crmvInput = document.getElementById('crmv');
    const crmvError = document.getElementById('crmv-error');

    // Função para verificar se CRMV já existe (excluindo o atual)
    async function verificarCRMVExistente(crmv, excludeId) {
        try {
            const response = await fetch(`/api/veterinario?crmv=${crmv}`);
            if (response.ok) {
                const veterinarios = await response.json();
                return veterinarios.some(vet => vet.crmv === crmv && vet.cod !== excludeId);
            }
            return false;
        } catch (error) {
            console.error('Erro ao verificar CRMV:', error);
            return false;
        }
    }

    // Verificar CRMV em tempo real
    let timeoutCRMV;
    crmvInput.addEventListener('input', function(e) {
        const crmv = e.target.value.trim();
        
        // Limpar timeout anterior
        clearTimeout(timeoutCRMV);
        
        // Esconder erro se campo estiver vazio
        if (!crmv) {
            crmvError.style.display = 'none';
            crmvInput.style.borderColor = '';
            return;
        }
        
        // Aguardar 500ms após parar de digitar para fazer a verificação
        timeoutCRMV = setTimeout(async () => {
            const existe = await verificarCRMVExistente(crmv, id);
            if (existe) {
                crmvError.style.display = 'block';
                crmvInput.style.borderColor = '#dc3545';
            } else {
                crmvError.style.display = 'none';
                crmvInput.style.borderColor = '#28a745';
            }
        }, 500);
    });

    try {
        // Buscar dados do veterinario
        const response = await fetch(`/api/veterinario/${id}`);
        if (!response.ok) {
            throw new Error('Veterinario não encontrado');
        }
        const veterinario = await response.json();

        // Preenche os campos
        document.getElementById('nome').value = veterinario.nome;
        document.getElementById('crmv').value = veterinario.crmv;
        document.getElementById('email').value = veterinario.email;
        const telefoneInput = document.getElementById('telefone');
        const telefoneError = document.getElementById('telefone-error');
        telefoneInput.value = aplicarMascaraTelefone(veterinario.telefone);

        const btnStatus = document.getElementById('btn-status');
        if (veterinario.status) {
            btnStatus.textContent = 'Desativar';
            btnStatus.style.backgroundColor = '#dc3545';
        } else {
            btnStatus.textContent = 'Ativar';
            btnStatus.style.backgroundColor = '#28a745';
        }

        // Adicionar evento de submit ao formulário
        const form = document.querySelector('form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Confirmar antes de gravar
            const confirmacao = confirm('Deseja realmente atualizar este veterinário?');
            if (!confirmacao) {
                return;
            }

            const formData = {
                nome: document.getElementById('nome').value,
                crmv: document.getElementById('crmv').value,
                email: document.getElementById('email').value,
                telefone: telefoneInput.value,
                status: btnStatus.textContent === 'Desativar'
            };

            try {
                const updateResponse = await fetch(`/api/veterinario/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (updateResponse.ok) {
                    alert('Veterinario atualizado com sucesso!');
                    window.location.href = 'buscar.html';
                } else {
                    const error = await updateResponse.json();
                    throw new Error(error.message || 'Erro ao atualizar veterinario');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao atualizar veterinario: ' + error.message);
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
        alert('Erro ao carregar dados do veterinario: ' + error.message);
        window.location.href = 'buscar.html';
    }
});

// Funções de máscara e validação (copiadas do cadastrar.js)
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